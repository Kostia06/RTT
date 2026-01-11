'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

// Transition context for exit animations
interface TransitionContextType {
  isExiting: boolean;
  startExitTransition: () => Promise<void>;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export const usePageTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    return { isExiting: false, startExitTransition: async () => {} };
  }
  return context;
};

const NUM_COLUMNS = 5;

export const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Handle page enter animation
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  const startExitTransition = async () => {
    setIsExiting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  return (
    <TransitionContext.Provider value={{ isExiting, startExitTransition }}>
      {/* Page content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.2, delay: isEntering ? 0.4 : 0 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>

      {/* Enter transition - columns shrink from top */}
      <AnimatePresence>
        {isEntering && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`enter-${i}`}
                className="flex-1 bg-white origin-top"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Exit transition - columns grow from bottom */}
      <AnimatePresence>
        {isExiting && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`exit-${i}`}
                className="flex-1 bg-white origin-bottom"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
};
