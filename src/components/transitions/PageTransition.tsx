'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'grid' | 'vertical' | 'horizontal' | 'logo' | 'none';
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
const NUM_ROWS = 4;

export const PageTransition = ({ children, variant = 'grid' }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // No animation for 'none' variant
  const animationDuration = variant === 'none' ? 0 : variant === 'logo' ? 1200 : variant === 'grid' ? 1000 : 800;
  const exitDuration = variant === 'none' ? 0 : variant === 'logo' ? 800 : variant === 'grid' ? 700 : 600;

  // Handle page enter animation
  useEffect(() => {
    if (variant === 'none') {
      setIsEntering(false);
      return;
    }
    setIsEntering(true);
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [pathname, variant, animationDuration]);

  const startExitTransition = async () => {
    if (variant === 'none') return;
    setIsExiting(true);
    await new Promise((resolve) => setTimeout(resolve, exitDuration));
  };

  // Grid variant: rectangles cover screen row by row on exit, uncover in reverse on enter
  const renderGridTransition = () => {
    const totalCells = NUM_COLUMNS * NUM_ROWS;
    const baseDelay = 0.025;

    return (
      <>
        {/* Exit transition - rectangles COVER screen left to right, row by row (top to bottom) */}
        <AnimatePresence>
          {isExiting && (
            <div className="fixed inset-0 z-[9999] pointer-events-none grid"
              style={{
                gridTemplateColumns: `repeat(${NUM_COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const row = Math.floor(index / NUM_COLUMNS);
                const col = index % NUM_COLUMNS;
                // Left to right, row by row (top to bottom)
                const sequentialIndex = row * NUM_COLUMNS + col;

                return (
                  <motion.div
                    key={`exit-${index}`}
                    className="bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ originX: 0 }} // Grow from left edge
                    transition={{
                      duration: 0.35,
                      delay: sequentialIndex * baseDelay,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Enter transition - rectangles UNCOVER screen in reverse (bottom-right to top-left) */}
        <AnimatePresence>
          {isEntering && (
            <div className="fixed inset-0 z-[9999] pointer-events-none grid"
              style={{
                gridTemplateColumns: `repeat(${NUM_COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const row = Math.floor(index / NUM_COLUMNS);
                const col = index % NUM_COLUMNS;
                // Reverse order: bottom-right to top-left
                const reverseIndex = (NUM_ROWS - 1 - row) * NUM_COLUMNS + (NUM_COLUMNS - 1 - col);

                return (
                  <motion.div
                    key={`enter-${index}`}
                    className="bg-white"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    style={{ originX: 1 }} // Shrink toward right edge
                    transition={{
                      duration: 0.35,
                      delay: reverseIndex * baseDelay,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </>
    );
  };

  // Vertical variant: top-to-bottom exit, bottom-to-top enter
  const renderVerticalTransition = () => (
    <>
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
      <AnimatePresence>
        {isEntering && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`enter-${i}`}
                className="flex-1 bg-white"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                style={{ originX: 1 }}
                transition={{
                  duration: 0.5,
                  delay: (NUM_COLUMNS - 1 - i) * 0.08,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExiting && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
              <motion.div
                key={`exit-${i}`}
                className="flex-1 bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }}
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

  // Logo variant: black background with RTT logo (for hero page)
  const renderLogoTransition = () => (
    <>
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
      case 'none':
        return null;
      case 'horizontal':
        return renderHorizontalTransition();
      case 'vertical':
        return renderVerticalTransition();
      case 'logo':
        return renderLogoTransition();
      case 'grid':
      default:
        return renderGridTransition();
    }
  };

  const contentDelay = variant === 'none' ? 0 : variant === 'logo' ? 0.6 : variant === 'grid' ? 0.5 : 0.4;

  return (
    <TransitionContext.Provider value={{ isExiting, startExitTransition }}>
      {/* Page content */}
      <motion.div
        initial={{ opacity: variant === 'none' ? 1 : 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: variant === 'none' ? 0 : 0.2, delay: isEntering ? contentDelay : 0 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>

      {renderTransition()}
    </TransitionContext.Provider>
  );
};
