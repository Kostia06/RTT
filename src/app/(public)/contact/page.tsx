'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title character animation
      gsap.fromTo(
        '.hero-char',
        { y: 120, opacity: 0, rotateX: -60 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1,
          stagger: 0.03,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      // Hero subtitle
      gsap.fromTo(
        '.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power3.out' }
      );

      // Parallax Kanji
      gsap.to('.hero-kanji', {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Form animation
      gsap.fromTo(
        formRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
          },
        }
      );

      // Form fields stagger
      gsap.fromTo(
        '.form-field',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
          },
        }
      );

      // Contact info cards
      gsap.fromTo(
        '.contact-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-cards',
            start: 'top 85%',
          },
        }
      );

      // Floating elements
      gsap.to('.float-element', {
        y: 'random(-15, 15)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.5, from: 'random' },
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = 'GET IN TOUCH';

  return (
    <div ref={heroRef} className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji */}
        <div className="hero-kanji absolute top-10 right-[5%] text-[30vw] sm:text-[25vw] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          連絡
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="float-element absolute top-[20%] left-[10%] w-12 h-12 sm:w-16 sm:h-16 border border-white/10 rounded-full" />
          <div className="float-element absolute top-[40%] right-[15%] w-6 h-6 sm:w-8 sm:h-8 bg-white/5 rotate-45" />
          <div className="float-element absolute bottom-[25%] left-[20%] w-8 h-8 sm:w-12 sm:h-12 border border-white/5" />
        </div>

        <div className="relative py-12 pt-20 sm:py-16 sm:pt-24 md:py-20 md:pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Link href="/" className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white/70">Contact</span>
            </div>

            {/* Animated Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] overflow-visible py-2"
              style={{ perspective: '1000px' }}
            >
              {title.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="block overflow-visible py-0.5 whitespace-nowrap">
                  {word.split('').map((char, charIndex) => (
                    <span
                      key={`${wordIndex}-${charIndex}`}
                      className="hero-char inline-block will-change-transform"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/60 max-w-lg leading-relaxed">
              Have a question or feedback? We&apos;d love to hear from you.
            </p>

            {/* Scroll indicator */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4">
              <div className="w-px h-12 sm:h-16 bg-white/20" />
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/30">Scroll to continue</span>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-6 sm:top-8 left-4 sm:left-8 w-16 sm:w-20 h-16 sm:h-20 border-l-2 border-t-2 border-white/10" />
        <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 w-16 sm:w-20 h-16 sm:h-20 border-r-2 border-b-2 border-white/10" />
      </div>

      {/* Main Content */}
      <div className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="lg:col-span-3">
              {/* Success Message */}
              {success && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-black text-white animate-fade-in">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1">Message Sent!</h3>
                      <p className="text-xs sm:text-sm text-white/70">
                        Thank you for contacting us. We&apos;ll get back to you soon!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-600 text-white animate-fade-in">
                  <p className="text-xs sm:text-sm">{error}</p>
                </div>
              )}

              {/* Contact Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="bg-white border-2 border-black p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="h-px bg-black/20 flex-1" />
                  <span className="text-[10px] sm:text-xs tracking-[0.3em] text-gray-400 uppercase">Send a Message</span>
                  <div className="h-px bg-black/20 flex-1" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Name */}
                  <div className="form-field">
                    <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm sm:text-base"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email */}
                  <div className="form-field">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wider">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm sm:text-base"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Subject */}
                  <div className="form-field">
                    <label htmlFor="subject" className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm sm:text-base"
                      placeholder="What is this about?"
                    />
                  </div>

                  {/* Message */}
                  <div className="form-field">
                    <label htmlFor="message" className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wider">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm sm:text-base resize-none"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="form-field w-full px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-bold text-xs sm:text-sm tracking-[0.1em] uppercase hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2 justify-center">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : success ? (
                      'Message Sent!'
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2">
              <div className="contact-cards space-y-4 sm:space-y-6">
                {/* Email */}
                <div className="contact-card group p-5 sm:p-6 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 uppercase tracking-wider">Email</h3>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-white/70 transition-colors">hello@respectthetechnique.com</p>
                </div>

                {/* Phone */}
                <div className="contact-card group p-5 sm:p-6 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 uppercase tracking-wider">Phone</h3>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-white/70 transition-colors">(555) 123-4567</p>
                </div>

                {/* Location */}
                <div className="contact-card group p-5 sm:p-6 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 uppercase tracking-wider">Location</h3>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-white/70 transition-colors">Calgary, Alberta</p>
                </div>

                {/* Hours */}
                <div className="contact-card group p-5 sm:p-6 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 uppercase tracking-wider">Hours</h3>
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-white/70 transition-colors">Mon-Fri: 9am - 6pm</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-black text-white">
                <h3 className="font-bold text-sm sm:text-base mb-3 uppercase tracking-wider">Quick Response</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  We typically respond within 24 hours. For urgent inquiries, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
