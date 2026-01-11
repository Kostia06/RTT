'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const NavigationProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset on route change
    setIsNavigating(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      return () => clearInterval(interval);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    };

    // Listen for route changes via click events on links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const url = new URL(link.href);
        if (url.pathname !== pathname) {
          handleStart();
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-black/10 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full bg-black"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
