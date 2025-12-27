/**
 * Animation Components & Utilities
 * Apple-style animations with 60fps performance
 */

// Hero & visual effects
export { NoodleHero } from './NoodleHero';
export { default as NoodleStrands } from './NoodleStrands';

// Scroll animations
export { ScrollProgress } from './ScrollProgress';
export { HorizontalScrollGallery } from './HorizontalScrollGallery';
export { default as CanvasScrollAnimation, generateImageSequence } from './CanvasScrollAnimation';

// Page transitions
export { PageTransition } from './PageTransition';

// Interactive elements
export { MagneticButton } from './MagneticButton';

// Text animations
export { default as AnimatedText, AnimatedTextWords, AnimatedTextLines } from './AnimatedText';

// Loading & preloaders
export { default as Preloader, MinimalPreloader, GradientPreloader } from './Preloader';

// Smooth scroll wrapper
export { default as SmoothScroll } from './SmoothScroll';

// Wrappers & utilities
export { default as AnimationWrapper, withReducedMotion } from './AnimationWrapper';
