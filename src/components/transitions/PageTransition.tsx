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

// ============================================
// TRANSITION ANIMATION CONFIGURATION
// ============================================
export const TRANSITION_CONFIG = {
  // Grid dimensions
  grid: {
    columns: 1,
    rows: 3,
  },
  // Animation timing (in seconds)
  timing: {
    rectangleDuration: 1,    // How long each rectangle animates
    rectangleDelay: 0.025,      // Delay between each rectangle
    contentFadeDelay: 1,      // Delay before content fades in
  },
  // Easing curve [cubic-bezier]
  easing: [0.76, 0, 0.24, 1] as const,
  // Duration limits (in milliseconds)
  durations: {
    grid: { enter: 1000, exit: 700 },
    logo: { enter: 1200, exit: 800 },
    default: { enter: 800, exit: 600 },
  },
} as const;
// ============================================

export const usePageTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    return { isExiting: false, startExitTransition: async () => {} };
  }
  return context;
};

export const PageTransition = ({ children, variant = 'grid' }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Get durations from config
  const getDurations = () => {
    if (variant === 'none') return { enter: 0, exit: 0 };
    if (variant === 'logo') return TRANSITION_CONFIG.durations.logo;
    if (variant === 'grid') return TRANSITION_CONFIG.durations.grid;
    return TRANSITION_CONFIG.durations.default;
  };
  const { enter: animationDuration, exit: exitDuration } = getDurations();

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
    const { columns, rows } = TRANSITION_CONFIG.grid;
    const { rectangleDuration, rectangleDelay } = TRANSITION_CONFIG.timing;
    const totalCells = columns * rows;

    return (
      <>
        {/* Exit transition - rectangles COVER screen left to right, row by row (top to bottom) */}
        <AnimatePresence>
          {isExiting && (
            <div className="fixed inset-0 z-[9999] pointer-events-none grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                // Left to right, row by row (top to bottom)
                const sequentialIndex = row * columns + col;

                return (
                  <motion.div
                    key={`exit-${index}`}
                    className="bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ originX: 0 }} // Grow from left edge
                    transition={{
                      duration: rectangleDuration,
                      delay: sequentialIndex * rectangleDelay,
                      ease: TRANSITION_CONFIG.easing,
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
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                // Reverse order: bottom-right to top-left
                const reverseIndex = (rows - 1 - row) * columns + (columns - 1 - col);

                return (
                  <motion.div
                    key={`enter-${index}`}
                    className="bg-white"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    style={{ originX: 1 }} // Shrink toward right edge
                    transition={{
                      duration: rectangleDuration,
                      delay: reverseIndex * rectangleDelay,
                      ease: TRANSITION_CONFIG.easing,
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
  const renderVerticalTransition = () => {
    const cols = TRANSITION_CONFIG.grid.columns;
    return (
      <>
        <AnimatePresence>
          {isEntering && (
            <div className="fixed inset-0 z-[9999] pointer-events-none flex">
              {Array.from({ length: cols }).map((_, i) => (
                <motion.div
                  key={`enter-${i}`}
                  className="flex-1 bg-white"
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: 0 }}
                  style={{ originY: 0 }}
                  transition={{
                    duration: TRANSITION_CONFIG.timing.rectangleDuration,
                    delay: i * TRANSITION_CONFIG.timing.rectangleDelay,
                    ease: TRANSITION_CONFIG.easing,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExiting && (
            <div className="fixed inset-0 z-[9999] pointer-events-none flex">
              {Array.from({ length: cols }).map((_, i) => (
                <motion.div
                  key={`exit-${i}`}
                  className="flex-1 bg-white"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ originY: 1 }}
                  transition={{
                    duration: TRANSITION_CONFIG.timing.rectangleDuration,
                    delay: i * TRANSITION_CONFIG.timing.rectangleDelay,
                    ease: TRANSITION_CONFIG.easing,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </>
    );
  };

  // Horizontal variant: left-to-right exit, right-to-left enter
  const renderHorizontalTransition = () => {
    const cols = TRANSITION_CONFIG.grid.columns;
    return (
      <>
        <AnimatePresence>
          {isEntering && (
            <div className="fixed inset-0 z-[9999] pointer-events-none flex">
              {Array.from({ length: cols }).map((_, i) => (
                <motion.div
                  key={`enter-${i}`}
                  className="flex-1 bg-white"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  style={{ originX: 1 }}
                  transition={{
                    duration: TRANSITION_CONFIG.timing.rectangleDuration,
                    delay: (cols - 1 - i) * TRANSITION_CONFIG.timing.rectangleDelay,
                    ease: TRANSITION_CONFIG.easing,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExiting && (
            <div className="fixed inset-0 z-[9999] pointer-events-none flex">
              {Array.from({ length: cols }).map((_, i) => (
                <motion.div
                  key={`exit-${i}`}
                  className="flex-1 bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ originX: 0 }}
                  transition={{
                    duration: TRANSITION_CONFIG.timing.rectangleDuration,
                    delay: i * TRANSITION_CONFIG.timing.rectangleDelay,
                    ease: TRANSITION_CONFIG.easing,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </>
    );
  };

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

  const contentDelay = variant === 'none' ? 0 : TRANSITION_CONFIG.timing.contentFadeDelay;

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
