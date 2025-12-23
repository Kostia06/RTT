'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const employees = [
  {
    id: 1,
    name: 'Kenji Tanaka',
    role: 'Head Chef',
    bio: 'With 15 years of experience in Hakata-style ramen, Kenji brings authentic techniques and passion to every bowl.',
    image: '/images/230401-RTT-NoodleMaking-005.JPG',
    specialty: 'Tonkotsu Broth Master',
  },
  {
    id: 2,
    name: 'Yuki Nakamura',
    role: 'Sous Chef',
    bio: 'Trained in Tokyo\'s finest ramen shops, Yuki specializes in noodle making and perfect texture.',
    image: '/images/230401-RTT-NoodleMaking-082.JPG',
    specialty: 'Noodle Artisan',
  },
  {
    id: 3,
    name: 'Hiro Matsumoto',
    role: 'Kitchen Manager',
    bio: 'Ensuring every bowl meets our high standards. Hiro manages our kitchen operations with precision.',
    image: '/images/230401-RTT-NoodleMaking-092.JPG',
    specialty: 'Quality Control',
  },
  {
    id: 4,
    name: 'Sakura Yamamoto',
    role: 'Lead Instructor',
    bio: 'Teaching the art of ramen making to students worldwide. Passionate about sharing traditional techniques.',
    image: '/images/230401-RTT-NoodleMaking-099.JPG',
    specialty: 'Education & Training',
  },
];

export default function EmployeesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero title animation
      gsap.fromTo(
        '.hero-title-char',
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

      // Employee cards
      gsap.fromTo(
        '.employee-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'OUR TEAM';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[-0.02em] mb-4">
              {title.split('').map((char, i) => (
                <span key={i} className="hero-title-char inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle text-sm sm:text-base text-white/60 max-w-2xl">
              Meet the talented individuals who bring authentic Hakata-style ramen to life every day.
            </p>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div ref={gridRef} className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="employee-card group"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                  <Image
                    src={employee.image}
                    alt={employee.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black transition-opacity duration-300 opacity-0 group-hover:opacity-10" />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-black text-black">
                      {employee.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.15em]">
                      {employee.role}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {employee.bio}
                  </p>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-black tracking-tight">
                      {employee.specialty}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-20 md:py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-black mb-4">
            Join Our Team
          </h2>

          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            We're always looking for passionate individuals who want to be part of our ramen journey.
          </p>

          <a
            href="mailto:careers@respectthetechnique.com"
            className="inline-block px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </div>
    </div>
  );
}
