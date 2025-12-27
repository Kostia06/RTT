'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/performance';

interface CanvasScrollAnimationProps {
  images: string[];
  className?: string;
  startOffset?: number;
  endOffset?: number;
}

/**
 * Canvas-based scroll animation with image sequence
 * Apple-style scroll scrubbing effect
 *
 * Performance optimizations:
 * - Image preloading with progress
 * - RequestAnimationFrame for smooth updates
 * - Canvas rendering (GPU accelerated)
 * - Reduced motion fallback
 */
export default function CanvasScrollAnimation({
  images,
  className = '',
  startOffset = 0,
  endOffset = 1,
}: CanvasScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedImages, setLoadedImages] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [shouldReduce] = useState(() => prefersReducedMotion());
  const frameIndexRef = useRef(0);
  const rafIdRef = useRef<number>();

  // Preload all images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImgs: HTMLImageElement[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        img.src = images[i];

        await new Promise<void>((resolve) => {
          img.onload = () => {
            loadedImgs.push(img);
            setLoadedImages(i + 1);
            resolve();
          };

          img.onerror = () => {
            console.error(`Failed to load image: ${images[i]}`);
            resolve();
          };
        });
      }

      imagesRef.current = loadedImgs;
      setIsReady(true);
    };

    loadImages();
  }, [images]);

  // Render frame to canvas
  const renderFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !imagesRef.current[frameIndex]) return;

    const img = imagesRef.current[frameIndex];

    // Set canvas size to match container
    const container = containerRef.current;
    if (container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio fit
    const scale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  };

  // Handle scroll
  useEffect(() => {
    if (!isReady || shouldReduce) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress
      const scrollStart = rect.top + windowHeight * startOffset;
      const scrollEnd = rect.top + windowHeight * endOffset;
      const scrollRange = scrollEnd - scrollStart;
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollRange));

      // Map to frame index
      const frameIndex = Math.min(
        imagesRef.current.length - 1,
        Math.floor(scrollProgress * (imagesRef.current.length - 1))
      );

      // Only update if frame changed
      if (frameIndexRef.current !== frameIndex) {
        frameIndexRef.current = frameIndex;

        // Cancel previous RAF
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }

        // Request new frame
        rafIdRef.current = requestAnimationFrame(() => {
          renderFrame(frameIndex);
        });
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial render
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isReady, shouldReduce, startOffset, endOffset]);

  // Render first frame when ready
  useEffect(() => {
    if (isReady && imagesRef.current.length > 0) {
      renderFrame(0);
    }
  }, [isReady]);

  // Reduced motion fallback - show static image
  if (shouldReduce && imagesRef.current[0]) {
    return (
      <div ref={containerRef} className={className}>
        <img
          src={images[0]}
          alt="Hero"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Loading progress */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Loading {loadedImages} / {images.length}
            </div>
            <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${(loadedImages / images.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${!isReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      />
    </div>
  );
}

/**
 * Generate array of image URLs for sequence
 * Example: generateImageSequence('/images/hero/frame-', 150, 'jpg')
 * Returns: ['/images/hero/frame-0001.jpg', '/images/hero/frame-0002.jpg', ...]
 */
export function generateImageSequence(
  basePath: string,
  frameCount: number,
  extension: string = 'jpg',
  startIndex: number = 1
): string[] {
  const images: string[] = [];

  for (let i = startIndex; i < startIndex + frameCount; i++) {
    const paddedIndex = i.toString().padStart(4, '0');
    images.push(`${basePath}${paddedIndex}.${extension}`);
  }

  return images;
}
