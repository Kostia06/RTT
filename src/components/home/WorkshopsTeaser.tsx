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
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshop-title',
            start: 'top 85%',
          },
        }
      );

      // Large featured workshop animation
      gsap.fromTo(
        '.workshop-featured',
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshop-featured',
            start: 'top 80%',
          },
        }
      );

      // Small workshops stagger
      gsap.fromTo(
        '.workshop-small',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.workshops-small-grid',
            start: 'top 75%',
          },
        }
      );

      // Floating Kanji parallax
      gsap.to('.workshop-kanji', {
        y: -150,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const workshops = [
    {
      title: 'Ramen Fundamentals',
      level: 'Beginner',
      duration: '3 hours',
      description: 'Master the basics of authentic ramen making. Learn broth preparation, noodle cooking, and proper assembly techniques from experienced chefs.',
      price: '$120',
      topics: ['Broth Types', 'Noodle Preparation', 'Essential Toppings', 'Plating'],
      icon: '🍜',
      featured: true,
    },
    {
      title: 'Advanced Broth Mastery',
      level: 'Advanced',
      duration: '4 hours',
      description: 'Deep dive into complex broth techniques and flavor layering',
      price: '$180',
      icon: '🔥',
    },
    {
      title: 'Homemade Noodles',
      level: 'Intermediate',
      duration: '2 hours',
      description: 'Create perfect fresh ramen noodles with ideal texture',
      price: '$95',
      icon: '🥢',
    },
  ];

  const [featuredWorkshop, ...smallWorkshops] = workshops;

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-white text-black relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Kanji with Parallax */}
      <div className="workshop-kanji absolute top-1/4 right-[5%] text-[35vw] font-black text-black/[0.02] pointer-events-none select-none">
        学
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Header */}
        <div className="workshop-title mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="h-px bg-black/20 w-12 sm:w-20" />
            <span className="text-xs sm:text-sm tracking-[0.3em] text-black/60 uppercase">Education</span>
            <div className="h-px bg-black/20 w-12 sm:w-20" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-black mb-3 sm:mb-4 break-words">
            LEARN RAMEN
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto px-4">
            Hands-on workshops with traditional techniques. Small classes, expert instruction.
          </p>
        </div>

        {/* Layout: Large featured + smaller workshops */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Large featured workshop */}
          <div className="workshop-featured group lg:row-span-2">
            <div className="relative h-full min-h-[500px] sm:min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden border-2 border-black/10 hover:border-black/30 transition-all duration-500">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Large Icon */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] sm:text-[20vw] opacity-5 group-hover:scale-110 transition-transform duration-700">
                {featuredWorkshop.icon}
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <div className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  featuredWorkshop.level === 'Beginner' ? 'bg-green-500 text-white' :
                  featuredWorkshop.level === 'Intermediate' ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {featuredWorkshop.level}
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm text-black text-xs tracking-wider uppercase mb-4">
                    Featured Workshop
                  </span>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <span className="text-4xl sm:text-5xl md:text-6xl flex-shrink-0">{featuredWorkshop.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black mb-2 group-hover:underline underline-offset-8 break-words">
                      {featuredWorkshop.title}
                    </h3>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-black/60 flex-wrap">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{featuredWorkshop.duration}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xl sm:text-2xl font-black text-black">{featuredWorkshop.price}</span>
                    </div>
                  </div>
                </div>

                <p className="text-black/80 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                  {featuredWorkshop.description}
                </p>

                {featuredWorkshop.topics && (
                  <div className="flex flex-wrap gap-2">
                    {featuredWorkshop.topics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-black/10 text-black text-xs font-medium rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Smaller workshop cards */}
          <div className="workshops-small-grid space-y-4 sm:space-y-6">
            {smallWorkshops.map((workshop, index) => (
              <div
                key={index}
                className="workshop-small group bg-gray-50 hover:bg-gray-100 transition-all duration-500 overflow-hidden border-2 border-black/10 hover:border-black/30"
              >
                <div className="flex gap-4 sm:gap-6 p-4 sm:p-6">
                  {/* Icon Section */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden border-2 border-black/5">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      <span className="text-2xl sm:text-3xl md:text-4xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                        {workshop.icon}
                      </span>

                      {/* Level Badge */}
                      <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-bold uppercase ${
                        workshop.level === 'Beginner' ? 'bg-green-500 text-white' :
                        workshop.level === 'Intermediate' ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'
                      }`}>
                        {workshop.level.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black mb-2 group-hover:underline underline-offset-4 break-words">
                      {workshop.title}
                    </h3>

                    <p className="text-black/70 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {workshop.description}
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-black/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{workshop.duration}</span>
                      </div>
                      <span className="text-black/30 hidden sm:inline">•</span>
                      <div className="text-base sm:text-lg font-black text-black">
                        {workshop.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View all CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase font-bold group text-black"
          >
            <span className="relative">
              Explore All Workshops
              <span className="absolute bottom-0 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
            </span>
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
