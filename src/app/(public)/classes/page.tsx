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

      // Parallax kanji
      gsap.to('.hero-kanji', {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Stats counters
      document.querySelectorAll('.stat-number').forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0');
        gsap.fromTo(
          { val: 0 },
          { val: target },
          {
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            onUpdate: function() {
              (el as HTMLElement).textContent = Math.floor(this.targets()[0].val).toString();
            }
          }
        );
      });

      // Class cards
      gsap.fromTo(
        '.class-card',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: classesRef.current,
            start: 'top 75%',
          },
        }
      );

      // Expectations items
      gsap.fromTo(
        '.expect-item',
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.expect-section',
            start: 'top 75%',
          },
        }
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'MASTER THE CRAFT';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji */}
        <div className="hero-kanji absolute top-10 right-[5%] text-[30vw] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          学
        </div>

        <div className="relative py-48 pt-56">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-12">
              <Link href="/" className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-xs tracking-[0.2em] uppercase text-white/70">Classes</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] overflow-hidden leading-[0.9]" style={{ perspective: '1000px' }}>
              {title.split('').map((char, i) => (
                <span
                  key={i}
                  className="hero-char inline-block"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle mt-8 text-xl md:text-2xl text-white/50 max-w-xl leading-relaxed">
              Join our hands-on ramen workshops and learn the ancient art of
              Hakata-style ramen from experienced chefs.
            </p>

            {/* Decorative line */}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-24 h-px bg-white/20" />
              <span className="text-xs tracking-[0.3em] uppercase text-white/30">Hands-on learning</span>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-white/10" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-white/10" />
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: 500, label: 'Students Trained', suffix: '+' },
              { num: 3, label: 'Class Types', suffix: '' },
              { num: 8, label: 'Max Class Size', suffix: '' },
              { num: 100, label: 'Hands-On', suffix: '%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="stat-number text-5xl font-black text-black" data-target={stat.num}>0</span>
                  <span className="text-3xl font-black text-black">{stat.suffix}</span>
                </div>
                <div className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div ref={classesRef} className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px bg-black/20 w-16" />
              <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Our Workshops</span>
              <div className="h-px bg-black/20 w-16" />
            </div>

            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black">
              CHOOSE YOUR
              <br />
              <span className="text-outline-black">PATH</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            {classes.map((classItem, i) => (
              <div
                key={classItem.id}
                className="class-card group bg-white border-2 border-gray-100 hover:border-black transition-all duration-500"
              >
                {/* Class Image Area */}
                <div className="relative aspect-[4/3] bg-black overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[70%] h-[70%] border border-white/10" />
                  </div>

                  {/* Kanji */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[15vw] lg:text-[8rem] font-black text-white/10 group-hover:text-white/20 transition-all duration-500">
                      {classItem.kanji}
                    </span>
                  </div>

                  {/* Level badge */}
                  <div className="absolute top-4 left-4 bg-white text-black px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase">
                    {classItem.level}
                  </div>

                  {/* Index */}
                  <div className="absolute bottom-4 right-4 text-5xl font-black text-white/20">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm tracking-[0.2em] uppercase border border-white px-6 py-3">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Class Info */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-black mb-1 group-hover:underline underline-offset-4">
                    {classItem.title}
                  </h3>
                  <p className="text-sm text-gray-500 uppercase tracking-[0.1em] mb-4">
                    {classItem.subtitle}
                  </p>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {classItem.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Max {classItem.maxStudents}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-black text-black">${classItem.price}</span>
                        <span className="text-sm text-gray-400 ml-1">/ person</span>
                      </div>
                      <Link
                        href={`/classes/${classItem.slug}`}
                        className="px-6 py-3 bg-black text-white text-xs font-bold tracking-[0.1em] uppercase hover:bg-gray-800 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-400">
                    Next: {classItem.nextDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="expect-section py-32 bg-black text-white relative overflow-hidden">
        {/* Background kanji */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 text-[30vw] font-black text-white/[0.02] leading-none pointer-events-none">
          期待
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <div className="flex items-center gap-6 mb-8">
                <div className="h-px bg-white/30 w-16" />
                <span className="text-sm tracking-[0.3em] text-white/50 uppercase">The Experience</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-[0.9]">
                WHAT TO
                <br />
                <span className="text-outline-white">EXPECT</span>
              </h2>

              <p className="mt-8 text-xl text-white/50 leading-relaxed max-w-lg">
                Our classes are designed to be immersive, hands-on experiences.
                You won&apos;t just watch—you&apos;ll do. By the end, you&apos;ll have created
                your own ramen from scratch.
              </p>
            </div>

            <div className="space-y-0">
              {[
                { icon: '人', title: 'Small Class Sizes', desc: 'Maximum of 8 students ensures personalized attention and guidance.' },
                { icon: '材', title: 'All Materials Included', desc: 'Premium ingredients, tools, and take-home materials provided.' },
                { icon: '師', title: 'Expert Instruction', desc: 'Learn from chefs with years of experience in authentic ramen.' },
                { icon: '食', title: 'Eat What You Make', desc: 'Enjoy the ramen you create during the class. The best reward!' },
              ].map((item, i) => (
                <div key={i} className="expect-item group border-t border-white/10 py-6 hover:bg-white/5 transition-colors px-6 -mx-6">
                  <div className="flex items-start gap-6">
                    <span className="text-3xl text-white/20 group-hover:text-white/40 transition-colors">{item.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform">
                        {item.title}
                      </h3>
                      <p className="text-white/50">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black mb-6">
            READY TO START
            <br />
            <span className="text-outline-black">YOUR JOURNEY?</span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">
            Join our next class and discover the art of authentic ramen making.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-4"
            >
              <span className="relative px-10 py-5 bg-black text-white text-sm tracking-[0.2em] uppercase font-bold overflow-hidden">
                <span className="relative z-10">Contact Us to Book</span>
                <span className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </span>
              <span className="w-14 h-14 border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Questions? Email us at <a href="mailto:classes@rtt.com" className="underline hover:text-black transition-colors">classes@rtt.com</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .text-outline-black {
          -webkit-text-stroke: 1.5px black;
          color: transparent;
        }
        .text-outline-white {
          -webkit-text-stroke: 1.5px white;
          color: transparent;
        }
      `}</style>
    </div>
  );
}
