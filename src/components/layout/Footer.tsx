'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'Contact form submission',
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          setFormData({ name: '', email: '', message: '' });
          setStatus('idle');
        }, 3000);
      } else {
        console.error('Error submitting form:', data);
        const errorMsg = data.details || data.error || 'Failed to send message';
        setErrorMessage(errorMsg);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setErrorMessage(errorMsg);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const shopLinks = [
    { href: '/shop', label: 'All Products' },
    { href: '/shop?category=ramen-bowl', label: 'Ramen Bowls' },
    { href: '/shop?category=retail-product', label: 'Retail' },
    { href: '/shop?category=merchandise', label: 'Merchandise' },
  ];

  const learnLinks = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const infoLinks = [
    { href: '/shipping', label: 'Shipping' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  // Hide footer on employee dashboard and related pages
  const hideFooter = pathname?.startsWith('/dashboard') ||
                     pathname?.startsWith('/admin/') ||
                     pathname?.startsWith('/orders') ||
                     pathname?.startsWith('/inventory') ||
                     pathname?.startsWith('/support') ||
                     pathname?.startsWith('/reports') ||
                     pathname?.startsWith('/time-tracking') ||
                     pathname?.startsWith('/schedule') ||
                     pathname?.startsWith('/inventory-advanced');

  if (hideFooter) {
    return null;
  }

  return (
    <footer id="contact" ref={footerRef} className="bg-black text-white relative overflow-hidden">
      {/* Large background text */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <span className="footer-bg-text block text-[25vw] font-black text-white/[0.02] leading-none whitespace-nowrap">
          RESPECT THE TECHNIQUE
        </span>
      </div>

      {/* Top decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-16 lg:mb-24">
          {/* Contact Info */}
          <div className="footer-column">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-xs tracking-[0.3em] uppercase text-white/40">Get in Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-6 sm:mb-8">
              LET&apos;S <span className="text-outline-white">TALK</span>
            </h2>

            <p className="text-white/60 text-base sm:text-lg mb-8 sm:mb-12 max-w-md">
              Have a question about our products, classes, or just want to talk ramen?
              We&apos;d love to hear from you.
            </p>

            {/* Contact Details */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white/90 text-sm uppercase tracking-wider mb-1">Email</h3>
                  <a
                    href="mailto:hello@respectthetechnique.com"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    hello@respectthetechnique.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white/90 text-sm uppercase tracking-wider mb-1">Location</h3>
                  <p className="text-white/60">
                    Calgary, Alberta<br />
                    Canada
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white/90 text-sm uppercase tracking-wider mb-1">Response Time</h3>
                  <p className="text-white/60">
                    Within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8 sm:mt-12">
              <h3 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {['instagram', 'facebook', 'twitter'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-11 h-11 sm:w-12 sm:h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 active:bg-white/20 transition-all duration-300 touch-manipulation"
                    aria-label={social}
                  >
                    {social === 'instagram' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    {social === 'facebook' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    )}
                    {social === 'twitter' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="footer-column">
            {status === 'success' ? (
              <div className="bg-white/5 border border-white/10 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Message Sent!</h3>
                <p className="text-white/60 text-sm sm:text-base">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : status === 'error' ? (
              <div className="bg-red-500/10 border border-red-500/30 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Error</h3>
                <p className="text-white/60 text-sm sm:text-base">
                  {errorMessage || 'Failed to send message. Please try again.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6">Send a Message</h3>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                      className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors text-base touch-manipulation"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors text-base touch-manipulation"
                    />
                  </div>

                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Your message..."
                      required
                      className="w-full px-4 py-3.5 sm:py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors resize-none text-base touch-manipulation"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-8 py-4 bg-white text-black font-bold text-sm tracking-[0.2em] uppercase hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 md:gap-8 border-t border-white/10 pt-10 sm:pt-12 md:pt-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 footer-column">
            <Link href="/" className="inline-block group touch-manipulation">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="footer-logo-spin relative w-12 h-12 sm:w-16 sm:h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Image
                    src="/images/logo.png"
                    alt="Respect the Technique"
                    fill
                    className="object-contain"
                    style={{ filter: 'invert(1) brightness(2)' }}
                  />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black tracking-[-0.02em] block">RTT</span>
                  <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/40 block">
                    Est. 2024
                  </span>
                </div>
              </div>
            </Link>

            <p className="mt-6 sm:mt-8 text-white/50 text-sm leading-relaxed max-w-xs">
              Authentic Hakata-style ramen, crafted with 18 hours of patience.
              Every bowl tells a story of dedication.
            </p>
          </div>

          {/* Shop Links */}
          <div className="footer-column md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4 sm:mb-6">Shop</h3>
            <ul className="space-y-3 sm:space-y-4">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white active:text-white transition-colors duration-300 inline-block group py-1 touch-manipulation"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4 sm:mb-6">Learn</h3>
            <ul className="space-y-3 sm:space-y-4">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white active:text-white transition-colors duration-300 inline-block group py-1 touch-manipulation"
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
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4 sm:mb-6">Info</h3>
            <ul className="space-y-3 sm:space-y-4">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white active:text-white transition-colors duration-300 inline-block group py-1 touch-manipulation"
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

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 footer-column">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-4 sm:mb-6">Newsletter</h3>
            <p className="text-sm text-white/50 mb-3 sm:mb-4">Get ramen updates</p>
            <Link
              href="#newsletter"
              className="inline-flex items-center gap-2 text-sm text-white border-b border-white/30 pb-1 hover:border-white active:border-white transition-colors touch-manipulation"
            >
              Subscribe
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-white/30 text-xs tracking-[0.1em] text-center md:text-left">
                &copy; {currentYear} RESPECT THE TECHNIQUE. ALL RIGHTS RESERVED.
              </p>
              <p className="text-white/20 text-xs">
                Created by{' '}
                <a
                  href="https://github.com/Kostia06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
                >
                  Kostia
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
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

      <style jsx>{`
        .text-outline-white {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
      `}</style>
    </footer>
  );
};
