'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'vertical' | 'horizontal' | 'logo';
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

export const PageTransition = ({ children, variant = 'vertical' }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Handle page enter animation
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, variant === 'logo' ? 1200 : 800);

    return () => clearTimeout(timer);
  }, [pathname, variant]);

  const startExitTransition = async () => {
    setIsExiting(true);
    await new Promise((resolve) => setTimeout(resolve, variant === 'logo' ? 800 : 600));
  };

  // Vertical variant: top-to-bottom exit, bottom-to-top enter (default)
  const renderVerticalTransition = () => (
    <>
      {/* Enter transition - columns shrink from top */}
      <AnimatePresence>
        {isEntering && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`enter-${i}`}
                className="flex-1 bg-white"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                style={{ originY: 0 }}
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
                className="flex-1 bg-white"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ originY: 1 }}
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
    </>
  );

  // Horizontal variant: left-to-right exit, right-to-left enter
  const renderHorizontalTransition = () => (
    <>
      {/* Enter transition - columns shrink from right to left */}
      <AnimatePresence>
        {isEntering && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`enter-${i}`}
                className="flex-1 bg-white"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                style={{ originX: 1 }} // Shrink from right
                transition={{
                  duration: 0.5,
                  delay: (NUM_COLUMNS - 1 - i) * 0.08, // Reverse order: right to left
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Exit transition - columns grow from left to right */}
      <AnimatePresence>
        {isExiting && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`exit-${i}`}
                className="flex-1 bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }} // Grow from left
                transition={{
                  duration: 0.5,
                  delay: i * 0.08, // Left to right order
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // Logo variant: black background with RTT logo (for hero page)
  const renderLogoTransition = () => (
    <>
      {/* Enter transition - black screen with logo fading out */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none bg-black flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-[-0.02em]">RTT</span>
                <div className="h-px w-16 bg-white/30" />
                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-medium text-white/70">
                  Respect The Technique
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit transition - black screen with logo fading in */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.15,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-[-0.02em]">RTT</span>
                <div className="h-px w-16 bg-white/30" />
                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-medium text-white/70">
                  Respect The Technique
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const renderTransition = () => {
    switch (variant) {
      case 'horizontal':
        return renderHorizontalTransition();
      case 'logo':
        return renderLogoTransition();
      case 'vertical':
      default:
        return renderVerticalTransition();
    }
  };

  return (
    <TransitionContext.Provider value={{ isExiting, startExitTransition }}>
      {/* Page content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.2, delay: isEntering ? (variant === 'logo' ? 0.6 : 0.4) : 0 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>

      {renderTransition()}
    </TransitionContext.Provider>
  );
};
