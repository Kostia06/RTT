'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const classes = [
  {
    id: 1,
    title: 'Ramen 101',
    subtitle: 'Beginner\'s Guide',
    slug: 'ramen-101',
    description: 'Perfect for beginners! Learn the fundamentals of ramen making, from broth basics to noodle handling.',
    duration: '3 hours',
    price: 75,
    level: 'Beginner',
    kanji: '初',
    maxStudents: 8,
    includes: ['All ingredients provided', 'Recipe booklet', 'Chopsticks to take home'],
    nextDate: 'January 15, 2025',
  },
  {
    id: 2,
    title: 'Broth Mastery',
    subtitle: 'Workshop',
    slug: 'broth-mastery',
    description: 'Dive deep into the art of broth making. Master tonkotsu, shoyu, and miso bases.',
    duration: '4 hours',
    price: 95,
    level: 'Intermediate',
    kanji: '匠',
    maxStudents: 6,
    includes: ['Premium ingredients', 'Take-home broth sample', 'Advanced recipe guide'],
    nextDate: 'January 22, 2025',
  },
  {
    id: 3,
    title: 'Noodle Making',
    subtitle: 'Techniques',
    slug: 'noodle-making',
    description: 'Hand-pull your own ramen noodles! Learn traditional techniques and perfect your skills.',
    duration: '3.5 hours',
    price: 85,
    level: 'Intermediate',
    kanji: '麺',
    maxStudents: 6,
    includes: ['Noodle-making tools', 'Fresh noodles to take home', 'Technique guide'],
    nextDate: 'February 5, 2025',
  },
];

export default function ClassesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const classesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title animation
      gsap.fromTo(
        '.hero-char',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      // Hero subtitle
      gsap.fromTo(
        '.hero-subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.5 }
      );

      // Class cards
      gsap.fromTo(
        '.class-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: classesRef.current,
            start: 'top 80%',
          },
        }
      );

      // Expectations items
      gsap.fromTo(
        '.expect-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.expect-section',
            start: 'top 80%',
          },
        }
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'MASTER THE CRAFT';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Compact */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-20 sm:pt-24">
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.02em] mb-4">
              {title.split('').map((char, i) => (
                <span key={i} className="hero-char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle text-sm sm:text-base text-white/60 max-w-2xl">
              Join our hands-on ramen workshops and learn the art of Hakata-style ramen from experienced chefs.
            </p>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div ref={classesRef} className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {classes.map((classItem, i) => (
              <Link
                key={classItem.id}
                href={`/classes/${classItem.slug}`}
                className="class-card group block"
              >
                {/* Class Header */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-800" />

                  {/* Level badge */}
                  <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase">
                    {classItem.level}
                  </div>

                  {/* Kanji - subtle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl font-black text-white/5">
                      {classItem.kanji}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    'opacity-0 group-hover:opacity-20'
                  }`} />
                </div>

                {/* Class Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1">
                      {classItem.title}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.15em]">
                      {classItem.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {classItem.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Max {classItem.maxStudents}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-black">${classItem.price}</span>
                      <span className="text-xs text-gray-400 ml-1">/ person</span>
                    </div>
                    <span className="text-xs font-bold tracking-[0.15em] uppercase text-gray-600 group-hover:text-black transition-colors">
                      Book Now →
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Next: {classItem.nextDate}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="expect-section py-16 sm:py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-black mb-12">
            What to Expect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Small Class Sizes', desc: 'Maximum of 8 students ensures personalized attention and guidance.' },
              { title: 'All Materials Included', desc: 'Premium ingredients, tools, and take-home materials provided.' },
              { title: 'Expert Instruction', desc: 'Learn from chefs with years of experience in authentic ramen.' },
              { title: 'Eat What You Make', desc: 'Enjoy the ramen you create during the class. The best reward!' },
            ].map((item, i) => (
              <div key={i} className="expect-item border-l-2 border-black pl-4 py-2">
                <h3 className="text-base font-bold text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 md:py-24 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            Ready to Start?
          </h2>

          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            Join our next class and discover the art of authentic ramen making.
          </p>

          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
          >
            Contact Us to Book
          </Link>

          <p className="mt-6 text-xs text-gray-500">
            Questions? Email us at <a href="mailto:classes@rtt.com" className="underline hover:text-black transition-colors">classes@rtt.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
