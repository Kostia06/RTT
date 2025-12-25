'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

      // Horizontal scroll text
      gsap.fromTo(
        '.horizontal-text',
        { x: '0%' },
        {
          x: '-50%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.horizontal-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Counter animation
      if (numberRef.current) {
        gsap.fromTo(
          { val: 0 },
          { val: 18 },
          {
            duration: 2.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: numberRef.current,
              start: 'top 80%',
            },
            onUpdate: function() {
              if (numberRef.current) {
                numberRef.current.textContent = Math.floor(this.targets()[0].val).toString();
              }
            }
          }
        );
      }

      // Timeline items
      gsap.fromTo(
        '.timeline-item',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
          },
        }
      );

      // Value cards
      gsap.fromTo(
        '.value-card',
        { y: 80, opacity: 0, rotateY: -10 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.values-section',
            start: 'top 75%',
          },
        }
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const title = 'OUR STORY';

  return (
    <div ref={heroRef} className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Kanji */}
        <div className="hero-kanji absolute top-10 right-[5%] text-[35vw] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          敬意
        </div>

        <div className="relative py-48 pt-56">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-12">
              <Link href="/" className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-xs tracking-[0.2em] uppercase text-white/70">About</span>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] overflow-hidden" style={{ perspective: '1000px' }}>
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

            <p className="hero-subtitle mt-8 text-xl md:text-2xl text-white/50 max-w-2xl leading-relaxed">
              Born from a passion for authentic Hakata ramen and a belief that
              great food requires great respect for the craft.
            </p>

            {/* Scroll indicator */}
            <div className="mt-16 flex items-center gap-4">
              <div className="w-px h-16 bg-white/20" />
              <span className="text-xs tracking-[0.3em] uppercase text-white/30">Scroll to explore</span>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-white/10" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-white/10" />
      </div>

      {/* Origin Story */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-6 mb-8">
                <div className="h-px bg-black/30 w-16" />
                <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">The Beginning</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black leading-[0.9]">
                FROM
                <br />
                HAKATA TO
                <br />
                <span className="text-outline-black">CALGARY</span>
              </h2>

              <div className="mt-12 space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Respect the Technique began with a simple obsession: creating the
                  perfect bowl of tonkotsu ramen. After years of studying in Hakata,
                  the birthplace of tonkotsu ramen, we brought those techniques to Calgary.
                </p>
                <p>
                  Every aspect of our ramen reflects the Hakata tradition. The milky,
                  collagen-rich broth. The thin, firm noodles. The carefully selected
                  toppings. Nothing is accidental.
                </p>
                <p>
                  We named ourselves &quot;Respect the Technique&quot; because that&apos;s exactly
                  what authentic ramen demands. There are no shortcuts to greatness.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {/* Decorative frame */}
                <div className="absolute inset-4 border border-black/10" />
                <div className="absolute inset-8 border border-black/5" />

                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-[15vw] lg:text-[8vw] font-black text-gray-200 block leading-none">RTT</span>
                    <span className="text-xs tracking-[0.3em] uppercase text-gray-400 mt-4 block">Est. 2024</span>
                  </div>
                </div>
              </div>

              {/* Floating accent */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-black flex items-center justify-center text-white">
                <span className="text-4xl font-black">博多</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Text */}
      <div className="horizontal-section py-8 bg-black border-y border-white/10 overflow-hidden">
        <div className="horizontal-text flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-sm tracking-[0.3em] text-white/40 uppercase mx-8 flex items-center gap-8">
              PATIENCE • TECHNIQUE • TRADITION • RESPECT • AUTHENTICITY
              <span className="w-2 h-2 bg-white/20 rotate-45" />
            </span>
          ))}
        </div>
      </div>

      {/* The 18 Hours Section */}
      <div className="py-32 bg-black text-white relative overflow-hidden">
        {/* Large background number */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 text-[40vw] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          18
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-baseline gap-4 mb-8">
                <span ref={numberRef} className="text-[10rem] md:text-[14rem] font-black leading-none">
                  0
                </span>
                <div className="text-white/40">
                  <span className="text-4xl font-light block">hours</span>
                  <span className="text-lg">of slow-simmering</span>
                </div>
              </div>

              <p className="text-xl text-white/60 leading-relaxed max-w-lg">
                That&apos;s how long we simmer our tonkotsu broth. Not 12. Not 15.
                Eighteen hours of patient, attentive cooking transforms ordinary
                bones into liquid gold.
              </p>
            </div>

            <div ref={timelineRef} className="space-y-0">
              {[
                { time: '0h', title: 'The Preparation', desc: 'Premium pork bones are carefully cleaned and prepared.' },
                { time: '6h', title: 'The Extraction', desc: 'Collagen begins breaking down, broth starts to cloud.' },
                { time: '12h', title: 'The Transformation', desc: 'Rich, milky texture develops. Umami intensifies.' },
                { time: '18h', title: 'The Perfection', desc: 'Peak flavor achieved. Ready for the bowl.' },
              ].map((step, i) => (
                <div key={i} className="timeline-item group border-t border-white/10 py-6 hover:bg-white/5 transition-colors px-6 -mx-6">
                  <div className="flex items-start gap-8">
                    <span className="text-2xl font-black text-white/30 font-mono w-16">{step.time}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform">
                        {step.title}
                      </h3>
                      <p className="text-white/50">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px bg-black/20 w-16" />
              <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Our Values</span>
              <div className="h-px bg-black/20 w-16" />
            </div>

            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black">
              WHAT WE
              <br />
              <span className="text-outline-black">STAND FOR</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1" style={{ perspective: '1000px' }}>
            {[
              { num: '01', title: 'AUTHENTICITY', kanji: '本物', desc: 'We don\'t take shortcuts or make compromises. Every bowl follows traditional Hakata methods passed down through generations.' },
              { num: '02', title: 'PATIENCE', kanji: '忍耐', desc: 'Great ramen cannot be rushed. From 18-hour broths to carefully timed noodles, we give each element the time it deserves.' },
              { num: '03', title: 'EDUCATION', kanji: '教育', desc: 'We believe in sharing our knowledge. Through recipes and products, we help others discover the art of authentic ramen.' },
            ].map((value, i) => (
              <div key={i} className="value-card bg-gray-50 p-10 group hover:bg-black hover:text-white transition-all duration-500">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-sm text-gray-400 group-hover:text-white/40 font-mono transition-colors">{value.num}</span>
                  <span className="text-4xl text-gray-200 group-hover:text-white/20 transition-colors">{value.kanji}</span>
                </div>

                <h3 className="text-2xl font-black mb-4 tracking-[-0.02em]">{value.title}</h3>
                <p className="text-gray-600 group-hover:text-white/60 transition-colors leading-relaxed">
                  {value.desc}
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200 group-hover:border-white/10 transition-colors">
                  <div className="w-0 h-1 bg-black group-hover:w-16 group-hover:bg-white transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="h-px bg-black/20 w-16" />
              <span className="text-sm tracking-[0.3em] text-gray-500 uppercase">Leadership</span>
              <div className="h-px bg-black/20 w-16" />
            </div>

            <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] text-black">
              OUR
              <br />
              <span className="text-outline-black">FOUNDERS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Co-Owner and Founder */}
            <div className="group">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-8">
                <Image
                  src="/images/co-owner-and-founder.webp"
                  alt="Co-Owner and Founder"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black transition-opacity duration-500 opacity-0 group-hover:opacity-10" />

                {/* Corner accents */}
                <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-white/60" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-white/60" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-black text-black tracking-tight">
                    Co-Owner & Founder
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2">
                    Visionary Leader
                  </p>
                </div>

                <div className="h-px bg-black/10 w-24" />

                <p className="text-base text-gray-600 leading-relaxed">
                  Leading the vision and bringing authentic Hakata-style ramen culture to Calgary.
                  With years of dedication to the craft, our founder ensures every bowl honors the
                  traditional techniques passed down through generations.
                </p>

                <div className="pt-6">
                  <blockquote className="relative pl-6 border-l-2 border-black italic text-gray-700">
                    &quot;Ramen is more than food—it&apos;s a discipline, a tradition, and a way of life.&quot;
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Co-Owner */}
            <div className="group">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-8">
                <Image
                  src="/images/co-owner.webp"
                  alt="Co-Owner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black transition-opacity duration-500 opacity-0 group-hover:opacity-10" />

                {/* Corner accents */}
                <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-white/60" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-white/60" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-black text-black tracking-tight">
                    Co-Owner
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-2">
                    Operations Director
                  </p>
                </div>

                <div className="h-px bg-black/10 w-24" />

                <p className="text-base text-gray-600 leading-relaxed">
                  Managing daily operations and ensuring every bowl meets our exacting standards
                  of quality and authenticity. With meticulous attention to detail, our co-owner
                  maintains the consistency that makes each visit memorable.
                </p>

                <div className="pt-6">
                  <blockquote className="relative pl-6 border-l-2 border-black italic text-gray-700">
                    &quot;Every element must be perfect. When everything comes together, that&apos;s when the magic happens.&quot;
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <Link
              href="/recipes"
              className="inline-flex items-center gap-4 group"
            >
              <span className="relative px-8 py-4 bg-black text-white text-sm tracking-[0.2em] uppercase font-bold overflow-hidden">
                <span className="relative z-10">Explore Our Recipes</span>
                <span className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </span>
              <span className="w-12 h-12 border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-outline-black {
          -webkit-text-stroke: 1.5px black;
          color: transparent;
        }
      `}</style>
    </div>
  );
}
