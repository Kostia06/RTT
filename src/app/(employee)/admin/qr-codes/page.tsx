'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import QRCodeDisplay from '@/components/time-tracking/QRCodeDisplay';
import gsap from 'gsap';

export default function AdminQRCodesPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [clockInUrl, setClockInUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    // GSAP hero animation
    const ctx = gsap.context(() => {
      const title = heroRef.current?.querySelector('.hero-title');
      if (title) {
        const text = title.textContent || '';
        const chars = text.split('');
        title.innerHTML = chars.map(char =>
          char === ' ' ? ' ' : `<span class="hero-title-char inline-block">${char}</span>`
        ).join('');

        gsap.fromTo('.hero-title-char',
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchQRCode();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchQRCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/qr-codes');
      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setClockInUrl(data.clockInUrl);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load QR code' });
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setMessage(null);
    setShowConfirm(false);

    try {
      const response = await fetch('/api/admin/qr-codes', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setClockInUrl(data.clockInUrl);
        setMessage({ type: 'success', text: 'QR code regenerated successfully! Please print and replace the old QR code.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to regenerate QR code' });
      }
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setRegenerating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section ref={heroRef} className="bg-black text-white py-16 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 className="hero-title text-5xl md:text-7xl font-black mb-4 overflow-hidden">
            QR CODE MANAGEMENT
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Generate and manage the employee time tracking QR code
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Message Display */}
          {message && (
            <div
              className={`p-6 border-2 font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div>
              <h2 className="text-2xl font-black mb-6">EMPLOYEE CLOCK-IN QR CODE</h2>
              <QRCodeDisplay qrCodeUrl={qrCodeUrl} displayUrl={clockInUrl} />
            </div>
          )}

          {/* Regenerate Section */}
          <div className="bg-gray-100 border-2 border-gray-200 p-8">
            <h3 className="text-xl font-black mb-4">REGENERATE QR CODE</h3>
            <p className="text-gray-700 mb-6">
              Regenerating the QR code will invalidate the previous QR code. You&apos;ll need to print
              and replace the old QR code at all time clock locations.
            </p>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-all border-2 border-black"
              >
                Regenerate QR Code
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600 font-bold">
                  Are you sure? This will invalidate the current QR code.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="px-6 py-3 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all disabled:bg-gray-400"
                  >
                    {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={regenerating}
                    className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-all border-2 border-black disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white border-2 border-gray-200 p-8">
            <h3 className="text-xl font-black mb-6">HOW TO USE THIS QR CODE</h3>
            <ol className="space-y-4 text-gray-700">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <span>
                  <strong className="block mb-1">Print this page</strong>
                  Click the &quot;Print QR Code&quot; button above to print a clean version of the QR code.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <span>
                  <strong className="block mb-1">Post near time clock location</strong>
                  Place the printed QR code in a visible location where employees clock in/out.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <span>
                  <strong className="block mb-1">Employees scan with their phone</strong>
                  Employees use their phone camera to scan the QR code.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <span>
                  <strong className="block mb-1">Select name and clock in/out</strong>
                  The QR code opens the clock-in page where employees select their name and click
                  &quot;Clock In&quot; or &quot;Clock Out&quot;.
                </span>
              </li>
            </ol>
          </div>

          {/* Alternative Access */}
          <div className="bg-blue-50 border-2 border-blue-200 p-8">
            <h3 className="text-xl font-black mb-4">ALTERNATIVE ACCESS</h3>
            <p className="text-gray-700 mb-4">
              Employees can also clock in/out without the QR code by visiting:
            </p>
            <div className="bg-white p-4 border-2 border-blue-300 font-mono text-sm break-all">
              {typeof window !== 'undefined' && `${window.location.origin}/clock-in`}
            </div>
            <p className="text-gray-600 text-sm mt-4">
              If logged in, they will be auto-identified. If not logged in, they can select their
              name from a dropdown.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
