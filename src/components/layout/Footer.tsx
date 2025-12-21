'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal animation for footer content
      gsap.fromTo(
        '.footer-column',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
          },
        }
      );

      // Animate the large background text
      gsap.fromTo(
        '.footer-bg-text',
        { x: '10%' },
        {
          x: '-20%',
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Rotate logo slowly
      gsap.to('.footer-logo-spin', {
        rotation: 360,
        duration: 60,
        ease: 'none',
        repeat: -1,
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const shopLinks = [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=ramen-bowl', label: 'Ramen Bowls' },
    { href: '/shop?category=retail-product', label: 'Retail' },
    { href: '/shop?category=merchandise', label: 'Merchandise' },
  ];

  const learnLinks = [
    { href: '/classes', label: 'Ramen Classes' },
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Contact' },
  ];

  const infoLinks = [
    { href: '/shipping', label: 'Shipping' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  return (
    <footer ref={footerRef} className="bg-black text-white relative overflow-hidden">
      {/* Large background text */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <span className="footer-bg-text block text-[25vw] font-black text-white/[0.02] leading-none whitespace-nowrap">
          RESPECT THE TECHNIQUE
        </span>
      </div>

      {/* Top decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand - takes more space */}
          <div className="col-span-2 md:col-span-4 footer-column">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-4">
                <div className="footer-logo-spin relative w-16 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Image
                    src="/images/logo.png"
                    alt="Respect the Technique"
                    fill
                    className="object-contain"
                    style={{ filter: 'invert(1) brightness(2)' }}
                  />
                </div>
                <div>
                  <span className="text-lg font-black tracking-[-0.02em] block">RTT</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 block">
                    Est. 2024
                  </span>
                </div>
              </div>
            </Link>

            <p className="mt-8 text-white/50 text-sm leading-relaxed max-w-xs">
              Authentic Hakata-style ramen, crafted with 18 hours of patience.
              Every bowl tells a story of dedication.
            </p>

            {/* Location */}
            <div className="mt-8 flex items-center gap-3">
              <div className="w-8 h-8 border border-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xs tracking-[0.1em] uppercase text-white/30 block">Location</span>
                <span className="text-sm text-white/70">Calgary, Alberta</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-8">
              {['instagram', 'facebook', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-300 group"
                  aria-label={social}
                >
                  {social === 'instagram' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {social === 'facebook' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social === 'twitter' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-column md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Shop</h3>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300 inline-block group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn Links */}
          <div className="footer-column md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Learn</h3>
            <ul className="space-y-4">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300 inline-block group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div className="footer-column md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Info</h3>
            <ul className="space-y-4">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300 inline-block group"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter mini */}
          <div className="col-span-2 md:col-span-2 footer-column">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Newsletter</h3>
            <p className="text-sm text-white/50 mb-4">Stay updated with new bowls and classes.</p>
            <Link
              href="#newsletter"
              className="inline-flex items-center gap-2 text-sm text-white border-b border-white/30 pb-1 hover:border-white transition-colors"
            >
              Subscribe
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/30 text-xs tracking-[0.1em]">
              &copy; {currentYear} RESPECT THE TECHNIQUE. ALL RIGHTS RESERVED.
            </p>

            <div className="flex items-center gap-6">
              <span className="text-xs text-white/20 tracking-[0.15em] uppercase">Made with patience</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-white/40">Open Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l border-b border-white/5" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r border-b border-white/5" />
    </footer>
  );
};
