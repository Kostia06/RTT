'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

/**
 * Character-by-character text reveal animation with GSAP
 * Uses IntersectionObserver for viewport detection
 */
export default function AnimatedText({
  text,
  className = '',
  as = 'p',
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          hasAnimated.current = true;

          const chars = containerRef.current?.querySelectorAll('.char');
          if (!chars) return;

          gsap.fromTo(
            chars,
            {
              opacity: 0,
              y: 20,
              rotationX: -90,
            },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.5,
              ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
              stagger: staggerDelay,
              delay: delay,
            }
          );

          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay, staggerDelay, once]);

  // Split text into characters while preserving spaces
  const characters = text.split('');

  const Component = as;

  return (
    <Component ref={containerRef as any} className={className} style={{ display: 'inline-block' }}>
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="char"
          style={{
            display: char === ' ' ? 'inline' : 'inline-block',
            transformOrigin: 'bottom',
            transformStyle: 'preserve-3d',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Component>
  );
}

/**
 * Word-by-word variant for longer text
 */
export function AnimatedTextWords({
  text,
  className = '',
  as = 'p',
  delay = 0,
  staggerDelay = 0.05,
  once = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          hasAnimated.current = true;

          const words = containerRef.current?.querySelectorAll('.word');
          if (!words) return;

          gsap.fromTo(
            words,
            {
              opacity: 0,
              y: 30,
              filter: 'blur(8px)',
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
              stagger: staggerDelay,
              delay: delay,
            }
          );

          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay, staggerDelay, once]);

  // Split text into words
  const words = text.split(' ');

  const Component = as;

  return (
    <Component ref={containerRef as any} className={className}>
      {words.map((word, index) => (
        <span key={index} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <span
            className="word"
            style={{
              display: 'inline-block',
              marginRight: '0.25em',
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}

/**
 * Line-by-line variant with mask reveal
 */
export function AnimatedTextLines({
  text,
  className = '',
  as = 'p',
  delay = 0,
  staggerDelay = 0.1,
  once = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          hasAnimated.current = true;

          const lines = containerRef.current?.querySelectorAll('.line');
          if (!lines) return;

          gsap.fromTo(
            lines,
            {
              y: '100%',
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
              stagger: staggerDelay,
              delay: delay,
            }
          );

          if (once) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [delay, staggerDelay, once]);

  // Split text into lines
  const lines = text.split('\n');

  const Component = as;

  return (
    <Component ref={containerRef as any} className={className}>
      <div>
        {lines.map((line, index) => (
          <div key={index} style={{ overflow: 'hidden', display: 'block' }}>
            <div className="line">{line}</div>
          </div>
        ))}
      </div>
    </Component>
  );
}
