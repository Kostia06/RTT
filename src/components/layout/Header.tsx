'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { CartIcon } from '@/components/cart/CartIcon';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitionLink } from '@/components/transitions';

gsap.registerPlugin(ScrollTrigger);

export const Header: React.FC = () => {
  const { isAuthenticated, isEmployee } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Pages with dark hero sections that should have transparent navbar initially
  const darkHeroPages = ['/', '/shop', '/recipes', '/workshops', '/about'];
  const hasDarkHero = darkHeroPages.some(page =>
    pathname === page || pathname?.startsWith('/shop/') || pathname?.startsWith('/recipes/') || pathname?.startsWith('/workshops') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin/')
  );

  // Auth pages should have black navbar
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const handleScroll = () => {
      // For auth pages, never change (handled by isAuthPage)
      // For pages with dark hero, transition to white background on scroll
      // For pages with white background, always show white navbar
      if (isAuthPage) {
        setScrolled(false); // Keep it in "non-scrolled" state for dark styling
      } else if (hasDarkHero) {
        setScrolled(window.scrollY > 20);
      } else {
        setScrolled(true);
      }
    };

    // Check initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasDarkHero, isAuthPage]);

  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      // Subtle logo scale on scroll
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const progress = Math.min(self.progress * 2, 1);

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
    }, headerRef);

    return () => ctx.revert();
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

  const baseNavLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  // Add employee dashboard link if user is an employee
  const navLinks = isEmployee
    ? [
        ...baseNavLinks.slice(0, 4), // Shop, Recipes, Workshops, About
        { href: '/dashboard', label: 'Dashboard' },
        baseNavLinks[4], // Contact
      ]
    : baseNavLinks;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isAuthPage
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-b border-white/10'
          : scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-black/5'
          : 'bg-gradient-to-b from-black/40 to-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <TransitionLink
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
          </TransitionLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 group ${
                    scrolled ? 'text-black hover:text-gray-700' : 'text-white/90 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className={`absolute inset-x-2 bottom-1.5 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center ${
                    scrolled ? 'bg-black' : 'bg-white'
                  }`} />
                </TransitionLink>
              ))}
            </div>
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center gap-5">
            <CartIcon scrolled={scrolled} />

            <div className={`h-4 w-px ${scrolled ? 'bg-black/20' : 'bg-white/20'}`} />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <TransitionLink
                  href="/account"
                  className={`text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-black hover:text-gray-700' : 'text-white/90 hover:text-white'
                  }`}
                >
                  Account
                </TransitionLink>
                <button
                  onClick={handleSignOut}
                  className={`text-xs font-medium tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-gray-600 hover:text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <TransitionLink
                  href="/login"
                  className={`text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 ${
                    scrolled ? 'text-black hover:text-gray-700' : 'text-white/90 hover:text-white'
                  }`}
                >
                  Sign In
                </TransitionLink>
                <TransitionLink
                  href="/register"
                  className={`relative px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase overflow-hidden transition-all duration-200 group ${
                    scrolled
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="relative z-10">Join Us</span>
                </TransitionLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <CartIcon scrolled={scrolled} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 touch-manipulation rounded ${
                mobileMenuOpen || scrolled
                  ? 'text-black hover:bg-black/5 active:bg-black/10'
                  : 'text-white hover:bg-white/10 active:bg-white/20'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block w-5 h-[2px] bg-current transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden fixed inset-0 top-16 sm:top-20 bg-white/98 backdrop-blur-lg z-50 overflow-y-auto"
          >
            <div className="py-6 px-4 sm:px-6 space-y-1">
              {navLinks.map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-menu-item block px-3 py-2.5 text-xs font-bold tracking-[0.05em] uppercase text-black hover:text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                >
                  {link.label}
                </TransitionLink>
              ))}

              <div className="pt-3 mt-3 border-t border-black/10 space-y-0.5">
                {isAuthenticated ? (
                  <>
                    <TransitionLink
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-menu-item block px-3 py-2.5 text-xs font-bold tracking-[0.05em] uppercase text-black hover:text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Account
                    </TransitionLink>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-menu-item block w-full text-left px-3 py-2.5 text-xs font-bold tracking-[0.05em] uppercase text-black/70 hover:text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="mobile-menu-item flex gap-2 pt-1 pb-2">
                    <TransitionLink
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center text-xs font-bold tracking-[0.15em] uppercase border border-black/30 text-black hover:bg-black/5 active:bg-black/10 rounded transition-all duration-200 touch-manipulation"
                    >
                      Sign In
                    </TransitionLink>
                    <TransitionLink
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center text-xs font-bold tracking-[0.15em] uppercase bg-black text-white hover:bg-gray-900 active:bg-gray-800 rounded transition-all duration-200 touch-manipulation"
                    >
                      Join Us
                    </TransitionLink>
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
