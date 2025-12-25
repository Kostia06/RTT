'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Recipe } from '@/types/recipe';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes?featured=true&limit=3');
        const data = await response.json();
        setRecipes(data.recipes || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    if (loading || recipes.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        '.recipe-section-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.recipe-section-line',
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        '.recipe-title-char',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.recipe-section-title',
            start: 'top 80%',
          },
        }
      );

      // Recipe cards stagger
      gsap.fromTo(
        '.recipe-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.recipes-grid',
            start: 'top 75%',
          },
        }
      );

      // Hover animations
      document.querySelectorAll('.recipe-card').forEach((card) => {
        const image = card.querySelector('.recipe-image');

        card.addEventListener('mouseenter', () => {
          gsap.to(image, { scale: 1.1, duration: 0.6, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(image, { scale: 1, duration: 0.6, ease: 'power2.out' });
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [loading, recipes]);

  if (loading) {
    return null;
  }

  if (recipes.length === 0) {
    return null;
  }

  const title = 'RECIPES';

  return (
    <section ref={sectionRef} className="py-32 bg-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="mb-20">
          <div className="flex items-center gap-8 mb-6">
            <div className="recipe-section-line h-px bg-white flex-1 max-w-[100px] origin-left" />
            <span className="text-sm tracking-[0.3em] text-gray-400 uppercase">Learn</span>
          </div>

          <h2 className="recipe-section-title text-6xl md:text-8xl font-black tracking-[-0.04em] text-white overflow-hidden">
            {title.split('').map((char, i) => (
              <span key={i} className="recipe-title-char inline-block">
                {char}
              </span>
            ))}
          </h2>

          <p className="mt-6 text-xl text-gray-400 max-w-2xl">
            Master the techniques. Understand the ingredients. Create authentic ramen at home.
          </p>
        </div>

        {/* Recipes grid */}
        <div className="recipes-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.slug}`}
              className="recipe-card group block"
            >
              <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden mb-6">
                {recipe.images?.[0]?.url && (
                  <Image
                    src={recipe.images[0].url}
                    alt={recipe.images[0].alt || recipe.title}
                    fill
                    className="recipe-image object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Difficulty badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                  recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {recipe.difficulty}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:underline underline-offset-4">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    {recipe.servings && (
                      <span>{recipe.servings} servings</span>
                    )}
                    <span>•</span>
                    <span>{recipe.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-16 text-center">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase font-bold group text-white"
          >
            <span className="relative">
              View All Recipes
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
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
