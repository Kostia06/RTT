'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Minimal typing for the browser Web Payments SDK injected by the script.
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => {
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
        }>;
      };
    };
  }
}

export interface SquareCardHandle {
  tokenize: () => Promise<{ token?: string; error?: string }>;
}

interface SquareCardProps {
  onStatusChange?: (status: 'loading' | 'ready' | 'unavailable') => void;
}

// The resolved card instance returned by `payments().card()`.
type SquareCardInstance = Awaited<
  ReturnType<ReturnType<NonNullable<Window['Square']>['payments']>['card']>
>;

const SDK_URL = {
  sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js',
  production: 'https://web.squarecdn.com/v1/square.js',
};

function loadSdk(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Square SDK failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Square SDK failed to load'));
    document.head.appendChild(script);
  });
}

export const SquareCard = forwardRef<SquareCardHandle, SquareCardProps>(function SquareCard(
  { onStatusChange },
  ref
) {
  const cardRef = useRef<SquareCardInstance | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let cancelled = false;
    const setState = (s: 'loading' | 'ready' | 'unavailable') => {
      if (cancelled) return;
      setStatus(s);
      onStatusChange?.(s);
    };

    (async () => {
      try {
        const cfg = await fetch('/api/payment/config').then((r) => r.json());
        if (!cfg.applicationId || !cfg.locationId) return setState('unavailable');
        await loadSdk(SDK_URL[cfg.environment === 'production' ? 'production' : 'sandbox']);
        if (cancelled || !window.Square) return setState('unavailable');
        const payments = window.Square.payments(cfg.applicationId, cfg.locationId);
        const card = await payments.card();
        await card.attach('#square-card-container');
        if (cancelled) return;
        cardRef.current = card;
        setState('ready');
      } catch (e) {
        console.error('Square card init failed:', e);
        setState('unavailable');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onStatusChange]);

  useImperativeHandle(ref, () => ({
    async tokenize() {
      if (!cardRef.current) return { error: 'Card form not ready' };
      try {
        const result = await cardRef.current.tokenize();
        if (result.status === 'OK' && result.token) return { token: result.token };
        return { error: result.errors?.[0]?.message || 'Card was not accepted' };
      } catch {
        return { error: 'Could not read card details' };
      }
    },
  }));

  if (status === 'unavailable') {
    return (
      <div className="border-2 border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Card payment is unavailable right now. Please choose <strong>pay at pickup</strong>.
      </div>
    );
  }

  return (
    <div>
      {status === 'loading' && <p className="mb-2 text-sm text-gray-500">Loading secure card form…</p>}
      <div id="square-card-container" className="min-h-[90px]" />
    </div>
  );
});
