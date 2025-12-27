'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const WorkshopsTeaser: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.workshop-title-elem',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshop-title-elem',
            start: 'top 85%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        '.workshop-card-new',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshops-grid-new',
            start: 'top 80%',
          },
        }
      );

      // CTA animation
      gsap.fromTo(
        '.workshop-cta',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshop-cta',
            start: 'top 85%',
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
      description: 'Master the basics of authentic ramen making, from broth preparation to perfect assembly',
      price: '$120',
      icon: '🍜',
    },
    {
      title: 'Advanced Broth Mastery',
      level: 'Advanced',
      duration: '4 hours',
      description: 'Deep dive into complex broth techniques and flavor layering with traditional methods',
      price: '$180',
      icon: '🔥',
    },
    {
      title: 'Homemade Noodles',
      level: 'Intermediate',
      duration: '2 hours',
      description: 'Learn to create perfect fresh ramen noodles with the ideal texture and bounce',
      price: '$95',
      icon: '🥢',
    },
  ];

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-black/[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/[0.02] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full py-20">
        {/* Header */}
        <div className="text-center mb-20 workshop-title-elem">
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-black/5 rounded-full">
            <span className="text-2xl">📚</span>
            <span className="text-xs tracking-[0.3em] text-gray-600 uppercase font-bold">Education</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tight">
            Learn Ramen
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hands-on workshops with traditional techniques.<br />
            Small classes, expert instruction, unforgettable experience.
          </p>
        </div>

        {/* Workshop Cards */}
        <div className="workshops-grid-new grid md:grid-cols-3 gap-8 mb-16">
          {workshops.map((workshop, index) => (
            <div
              key={index}
              className="workshop-card-new group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Card Header with Icon */}
              <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                <span className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                  {workshop.icon}
                </span>

                {/* Level Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  workshop.level === 'Beginner' ? 'bg-green-500 text-white' :
                  workshop.level === 'Intermediate' ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {workshop.level}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-2xl font-black text-black mb-3 group-hover:text-gray-700 transition-colors">
                  {workshop.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {workshop.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workshop.duration}</span>
                  </div>
                  <div className="text-2xl font-black text-black">
                    {workshop.price}
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="workshop-cta bg-black rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Master the Craft?
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join our next workshop and learn from experienced chefs in an intimate setting.
            </p>

            <Link
              href="/workshops"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all duration-300 rounded-full group shadow-xl"
            >
              <span>Explore All Workshops</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
