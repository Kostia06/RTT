'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

/**
 * Apple-style preloader with progress counter using GSAP
 * Smooth progress bar with cubic bezier easing
 */
export default function Preloader({ onComplete, duration = 2500 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Apply easing to progress
      const easedProgress = easeOutQuart(rawProgress);
      setProgress(Math.floor(easedProgress * 100));

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Wait a bit before starting exit animation
        setTimeout(() => {
          setIsComplete(true);

          // Exit animation
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              scale: 1.1,
              filter: 'blur(20px)',
              duration: 0.8,
              ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
              onComplete: () => {
                onComplete?.();
              },
            });
          }
        }, 300);
      }
    };

    requestAnimationFrame(animate);
  }, [duration, onComplete]);

  // Easing function for smooth progress
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  // Initial animations
  useEffect(() => {
    if (!containerRef.current) return;

    const logo = containerRef.current.querySelector('.preloader-logo');
    const counter = containerRef.current.querySelector('.preloader-counter');
    const progressBar = containerRef.current.querySelector('.preloader-progress-bar');
    const text = containerRef.current.querySelector('.preloader-text');

    gsap.set([logo, counter, progressBar, text], { opacity: 0 });

    const tl = gsap.timeline();

    tl.to(logo, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
    })
    .to(counter, {
      opacity: 1,
      duration: 0.6,
      delay: 0.3,
    }, '<')
    .to(progressBar, {
      opacity: 1,
      scaleX: 1,
      duration: 0.8,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
      delay: 0.2,
    }, '<')
    .to(text, {
      opacity: 1,
      duration: 0.6,
      delay: 0.5,
    }, '<');
  }, []);

  if (isComplete && !containerRef.current) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      {/* Logo or brand name */}
      <div className="preloader-logo mb-12">
        <h1 className="text-6xl font-bold tracking-tight">RTT</h1>
      </div>

      {/* Progress counter */}
      <div className="preloader-counter mb-8 text-4xl font-light tabular-nums">
        {progress}%
      </div>

      {/* Progress bar container */}
      <div className="preloader-progress-bar relative w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div
          className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading text */}
      <p className="preloader-text mt-8 text-sm text-gray-500">
        Loading experience...
      </p>
    </div>
  );
}

/**
 * Minimal preloader variant - just spinner
 */
export function MinimalPreloader({ onComplete, duration = 2000 }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Spin animation
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: 'linear',
      });
    }

    // Exit after duration
    const timer = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
          onComplete: () => {
            onComplete?.();
          },
        });
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div
        ref={spinnerRef}
        className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full"
      />
    </div>
  );
}

/**
 * Gradient preloader variant
 */
export function GradientPreloader({ onComplete, duration = 2500 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(easedProgress * 100);

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              scale: 0.95,
              duration: 0.8,
              ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
              onComplete: () => {
                onComplete?.();
              },
            });
          }
        }, 300);
      }
    };

    requestAnimationFrame(animate);
  }, [duration, onComplete]);

  // Initial animation
  useEffect(() => {
    if (!contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg,
          rgb(255, 245, 235) 0%,
          rgb(254, 237, 220) ${progress}%,
          rgb(253, 224, 200) 100%)`,
      }}
    >
      <div ref={contentRef} className="text-center">
        <h1 className="text-7xl font-bold mb-4">RTT</h1>
        <div
          className="h-1 bg-black rounded-full mx-auto transition-all duration-300"
          style={{ width: `${progress}%`, maxWidth: '200px' }}
        />
      </div>
    </div>
  );
}
