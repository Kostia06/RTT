'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WorkshopsPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero character animation
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
        { y: 0, opacity: 1, duration: 0.8, delay: 0.8 }
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

      // Workshop cards animation
      gsap.fromTo(
        '.workshop-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshops-container',
            start: 'top 75%',
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'WORKSHOPS';

  const workshops = [
    {
      title: 'Ramen Fundamentals',
      duration: '3 hours',
      level: 'Beginner',
      description: 'Learn the basics of ramen making. Perfect for those new to Japanese cuisine.',
      topics: [
        'Understanding broth types (Tonkotsu, Shoyu, Miso)',
        'Noodle preparation and cooking',
        'Essential toppings and garnishes',
        'Proper plating techniques'
      ],
      price: '$95',
    },
    {
      title: 'Advanced Broth Mastery',
      duration: '4 hours',
      level: 'Advanced',
      description: 'Deep dive into the art of creating complex, layered broths from scratch.',
      topics: [
        'Stock preparation and extraction techniques',
        'Tare (seasoning base) development',
        'Aromatics and umami building',
        'Temperature control and timing'
      ],
      price: '$145',
    },
    {
      title: 'Homemade Noodles',
      duration: '2 hours',
      level: 'Intermediate',
      description: 'Master the craft of making fresh ramen noodles with perfect texture.',
      topics: [
        'Flour selection and hydration',
        'Kneading and resting techniques',
        'Rolling and cutting methods',
        'Alkaline water (Kansui) usage'
      ],
      price: '$75',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji with Parallax */}
        <div className="hero-kanji absolute top-10 right-[5%] text-[35vw] font-black text-white/[0.02] pointer-events-none select-none">
          学
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-20 sm:py-20 sm:pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Workshops</span>
          </div>

          {/* Animated Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-none mb-4">
            {title.split('').map((char, i) => (
              <span key={i} className="hero-char inline-block" style={{ perspective: '1000px' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-xl md:text-2xl text-white/80 max-w-3xl leading-relaxed">
            Learn from experienced chefs. Master traditional techniques. Create authentic ramen at home.
          </p>

          {/* Scroll Indicator */}
          <div className="mt-8 flex items-center gap-4 text-sm text-white/60">
            <div className="w-px h-16 bg-white/20 animate-pulse" />
            <span className="uppercase tracking-wider">Scroll to explore</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Introduction */}
        <div className="max-w-3xl mb-20">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Why Learn Ramen?</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Ramen is more than just a meal—it&apos;s a craft that requires dedication, precision, and respect for ingredients.
            Our workshops are designed to pass down traditional techniques while encouraging creativity and personal expression.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Whether you&apos;re a home cook looking to expand your skills or an aspiring chef interested in Japanese cuisine,
            our hands-on classes provide the foundation you need.
          </p>
        </div>

        {/* Workshops */}
        <div className="workshops-container space-y-8">
          {workshops.map((workshop, index) => (
            <div
              key={index}
              className="workshop-card bg-white border-2 border-black p-8 md:p-12 hover:shadow-2xl transition-shadow"
            >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Left: Info */}
                <div className="md:col-span-1">
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2 ${
                      workshop.level === 'Beginner' ? 'bg-green-500 text-white' :
                      workshop.level === 'Intermediate' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {workshop.level}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3">{workshop.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-lg text-black">{workshop.price}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="md:col-span-2">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {workshop.description}
                  </p>
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-900">
                    What You&apos;ll Learn:
                  </h4>
                  <ul className="space-y-2">
                    {workshop.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-black text-white text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          {/* Class Details */}
          <div className="bg-black text-white p-8">
            <h3 className="text-2xl font-black mb-6">Class Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold mb-1">Group Size</h4>
                <p className="text-white/70">Maximum 12 students per class for personalized attention</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Location</h4>
                <p className="text-white/70">Classes held at our kitchen in downtown location</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Materials</h4>
                <p className="text-white/70">All ingredients and tools provided. Take home recipes included</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">Schedule</h4>
                <p className="text-white/70">Weekend classes available. Private sessions by appointment</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-100 p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-black mb-6">Interested in Joining?</h3>
            <p className="text-gray-700 mb-6">
              Classes fill up quickly! Contact us for availability and booking information.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:workshops@respectthetechnique.com" className="hover:underline">
                  workshops@respectthetechnique.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(555) 123-4567</span>
              </div>
            </div>
            <button className="mt-6 w-full px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors">
              Request Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
