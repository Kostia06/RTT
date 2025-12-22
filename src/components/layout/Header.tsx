'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { CartIcon } from '@/components/cart/CartIcon';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.1)]'
          : 'bg-transparent'
      }`}
    >
      {/* Top accent line */}
      <div className={`h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`} />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="group flex-shrink-0"
          >
            <div className={`transition-colors duration-300 ${scrolled ? 'text-black' : 'text-white'}`}>
              <span className="text-xs sm:text-sm tracking-[0.15em] uppercase font-bold block leading-tight">Respect</span>
              <span className="text-xs sm:text-sm tracking-[0.15em] uppercase font-bold block leading-tight">The Technique</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 text-sm font-medium tracking-[0.05em] uppercase transition-colors group ${
                    scrolled ? 'text-gray-600 hover:text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 group-hover:w-full group-hover:h-[2px] group-hover:rounded-none ${
                    scrolled ? 'bg-black' : 'bg-white'
                  }`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center gap-6">
            <CartIcon scrolled={scrolled} />

            <div className={`h-6 w-px ${scrolled ? 'bg-black/10' : 'bg-white/20'}`} />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/account"
                  className={`text-sm font-medium tracking-[0.05em] uppercase transition-colors ${
                    scrolled ? 'text-gray-600 hover:text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`text-sm font-medium tracking-[0.05em] uppercase transition-colors ${
                    scrolled ? 'text-gray-400 hover:text-black' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={`text-sm font-medium tracking-[0.05em] uppercase transition-colors ${
                    scrolled ? 'text-gray-600 hover:text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`relative px-5 py-2.5 text-sm font-bold tracking-[0.1em] uppercase overflow-hidden group ${
                    scrolled
                      ? 'bg-black text-white'
                      : 'border border-white text-white'
                  }`}
                >
                  <span className="relative z-10">Join</span>
                  <span className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${
                    scrolled ? 'bg-gray-800' : 'bg-white'
                  }`} />
                  <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 ${
                    scrolled ? 'text-white' : 'text-black'
                  }`}>
                    Join
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2 sm:gap-4">
            <CartIcon scrolled={scrolled} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`relative w-11 h-11 flex flex-col items-center justify-center gap-1.5 transition-colors touch-manipulation ${
                scrolled ? 'text-black' : 'text-white'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden overflow-hidden bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-gray-100"
          >
            <div className="py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-menu-item block py-4 text-base font-semibold text-gray-900 hover:text-black active:bg-gray-50 border-b border-gray-100 transition-colors touch-manipulation"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-menu-item block py-4 text-base font-semibold text-gray-900 hover:text-black active:bg-gray-50 transition-colors touch-manipulation"
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-menu-item block w-full text-left py-4 text-base font-semibold text-gray-500 hover:text-gray-900 active:bg-gray-50 transition-colors touch-manipulation"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="mobile-menu-item flex gap-3 pt-2 pb-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-4 text-center text-sm font-bold tracking-[0.1em] uppercase border-2 border-black text-black hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-4 text-center text-sm font-bold tracking-[0.1em] uppercase bg-black text-white hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
                    >
                      Join
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
