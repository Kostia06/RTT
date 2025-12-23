'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { CartIcon } from '@/components/cart/CartIcon';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      // Header scroll effects
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const progress = Math.min(self.progress * 2, 1);

          // Background opacity fade in
          if (headerRef.current) {
            gsap.to(headerRef.current, {
              backgroundColor: `rgba(255, 255, 255, ${progress})`,
              boxShadow: `0 1px 0 rgba(0, 0, 0, ${progress * 0.1})`,
              duration: 0.3,
              overwrite: 'auto',
            });
          }

          // Logo scale down slightly
          if (logoRef.current) {
            gsap.to(logoRef.current, {
              scale: 1 - (progress * 0.05),
              duration: 0.3,
              overwrite: 'auto',
            });
          }
        },
      });

      // Hide header on scroll down, show on scroll up - faster animation
      let lastScroll = 0;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          if (currentScroll > 100) {
            if (currentScroll > lastScroll && !mobileMenuOpen) {
              // Scrolling down - faster hide
              gsap.to(headerRef.current, {
                y: -100,
                duration: 0.15,
                ease: 'power2.in',
              });
            } else {
              // Scrolling up - faster show
              gsap.to(headerRef.current, {
                y: 0,
                duration: 0.15,
                ease: 'power2.out',
              });
            }
          }
          lastScroll = currentScroll;
        },
      });
    }, headerRef);

    return () => ctx.revert();
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.mobile-menu-item',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/classes', label: 'Classes' },
    { href: '/about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)] border-b border-black/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="group flex-shrink-0 relative"
          >
            <div ref={logoRef} className={`transition-all duration-300 ${scrolled ? 'text-black' : 'text-white'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black tracking-[-0.02em] leading-none">RTT</span>
                <div className={`h-3 w-px ${scrolled ? 'bg-black/20' : 'bg-white/30'}`} />
                <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium opacity-70">Respect The Technique</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 group ${
                    scrolled ? 'text-gray-700 hover:text-black' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className={`absolute inset-x-2 bottom-1.5 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center ${
                    scrolled ? 'bg-black' : 'bg-white'
                  }`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center gap-5">
            <CartIcon scrolled={scrolled} />

            <div className={`h-4 w-px ${scrolled ? 'bg-black/8' : 'bg-white/15'}`} />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className={`text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-gray-700 hover:text-black' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`text-xs font-medium tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-gray-700 hover:text-black' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`relative px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase overflow-hidden transition-all duration-200 group ${
                    scrolled
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="relative z-10">Join Us</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <CartIcon scrolled={scrolled} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 touch-manipulation rounded ${
                scrolled
                  ? 'text-black hover:bg-black/5 active:bg-black/10'
                  : 'text-white hover:bg-white/10 active:bg-white/20'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden overflow-hidden bg-white/98 backdrop-blur-lg -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-black/5"
          >
            <div className="py-3 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-menu-item block px-3 py-3.5 text-sm font-bold tracking-[0.05em] uppercase text-gray-900 hover:text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-black/5 space-y-0.5">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-menu-item block px-3 py-3.5 text-sm font-bold tracking-[0.05em] uppercase text-gray-900 hover:text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-menu-item block w-full text-left px-3 py-3.5 text-sm font-bold tracking-[0.05em] uppercase text-gray-600 hover:text-gray-900 hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="mobile-menu-item flex gap-2 pt-1 pb-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3.5 text-center text-xs font-bold tracking-[0.15em] uppercase border border-black/20 text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3.5 text-center text-xs font-bold tracking-[0.15em] uppercase bg-black text-white hover:bg-gray-800 active:bg-gray-900 rounded transition-all duration-200 touch-manipulation"
                    >
                      Join Us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
