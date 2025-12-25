'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const WorkshopsTeaser: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.workshop-title',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshop-title',
            start: 'top 85%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        '.workshop-card-clean',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshops-grid-clean',
            start: 'top 80%',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const workshops = [
    {
      title: 'Ramen Fundamentals',
      level: 'Beginner',
      duration: '3 hours',
      description: 'Master the basics of authentic ramen making',
    },
    {
      title: 'Advanced Broth',
      level: 'Advanced',
      duration: '4 hours',
      description: 'Deep dive into complex broth techniques',
    },
    {
      title: 'Homemade Noodles',
      level: 'Intermediate',
      duration: '2 hours',
      description: 'Create perfect fresh ramen noodles',
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Simple header */}
        <div className="text-center mb-16 workshop-title">
          <span className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4 block">Education</span>
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            Learn Ramen
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Hands-on workshops with traditional techniques
          </p>
        </div>

        {/* Clean workshop cards */}
        <div className="workshops-grid-clean grid md:grid-cols-3 gap-6 mb-12">
          {workshops.map((workshop, index) => (
            <div
              key={index}
              className="workshop-card-clean bg-white border border-gray-200 p-6 hover:border-black transition-all group"
            >
              <div className="mb-4">
                <span className={`inline-block text-[10px] px-2 py-1 font-bold uppercase ${
                  workshop.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  workshop.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {workshop.level}
                </span>
              </div>

              <h3 className="text-xl font-bold text-black mb-2 group-hover:underline underline-offset-2">
                {workshop.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {workshop.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{workshop.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            <span>View All Workshops</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
