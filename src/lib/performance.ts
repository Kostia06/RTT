/**
 * Performance Optimization Utilities
 * Image optimization, preloading, and resource hints
 */

/**
 * Check if user prefers reduced motion
 * Respect accessibility preferences
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Preload critical images
 * Use for hero images, above-the-fold content
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;

  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(srcs: string[], priority: 'high' | 'low' = 'high'): void {
  srcs.forEach(src => preloadImage(src, priority));
}

/**
 * DNS prefetch for external domains
 * Resolve DNS before fetching resources
 */
export function dnsPrefetch(domain: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;

  document.head.appendChild(link);
}

/**
 * Preconnect to external domains
 * Establish early connections to important third-party origins
 */
export function preconnect(domain: string, crossOrigin = true): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;

  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Lazy load images with IntersectionObserver
 * Alternative to Next.js Image for custom use cases
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  onLoad?: () => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = src;

          target.onload = () => {
            target.classList.add('loaded');
            onLoad?.();
          };

          observer.unobserve(target);
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
    }
  );

  observer.observe(img);
  return observer;
}

/**
 * Debounce function for scroll/resize handlers
 * Improves performance by limiting function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for high-frequency events
 * Ensures function runs at most once per specified time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback wrapper
 * Run non-critical tasks when browser is idle
 */
export function runWhenIdle(callback: () => void, timeout = 2000): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}

/**
 * Get optimal image format support
 * Check for WebP/AVIF support
 */
export async function getOptimalImageFormat(): Promise<'avif' | 'webp' | 'jpg'> {
  if (typeof window === 'undefined') return 'jpg';

  // Check AVIF support
  const avif = new Image();
  avif.src =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';

  const webp = new Image();
  webp.src =
    'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

  try {
    await avif.decode();
    return 'avif';
  } catch {
    try {
      await webp.decode();
      return 'webp';
    } catch {
      return 'jpg';
    }
  }
}

/**
 * Monitor Core Web Vitals
 * Track LCP, FID, CLS for performance monitoring
 */
export function reportWebVitals(metric: any): void {
  if (typeof window === 'undefined') return;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', metric.name, metric.value);
  }

  // Send to analytics in production
  // window.gtag?.('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_category: 'Web Vitals',
  //   event_label: metric.id,
  //   non_interaction: true,
  // });
}

/**
 * Check if device supports hover
 * Useful for disabling hover effects on touch devices
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Get connection speed
 * Useful for adaptive loading strategies
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if (typeof window === 'undefined') return 'medium';

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;

  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  return 'slow';
}

/**
 * Adaptive loading: Load high-quality assets only on fast connections
 */
export function shouldLoadHighQuality(): boolean {
  const speed = getConnectionSpeed();
  return speed === 'fast';
}
