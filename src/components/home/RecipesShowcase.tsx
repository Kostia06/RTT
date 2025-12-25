'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Recipe } from '@/types/recipe';

gsap.registerPlugin(ScrollTrigger);

export const RecipesShowcase: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes?featured=true&limit=4');
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
      // Title animation
      gsap.fromTo(
        '.showcase-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.showcase-title',
            start: 'top 85%',
          },
        }
      );

      // Large featured card animation
      gsap.fromTo(
        '.showcase-large-card',
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.showcase-large-card',
            start: 'top 80%',
          },
        }
      );

      // Small cards stagger
      gsap.fromTo(
        '.showcase-small-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.showcase-grid',
            start: 'top 75%',
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, [loading, recipes]);

  if (loading || recipes.length === 0) {
    return null;
  }

  const [mainRecipe, ...otherRecipes] = recipes;

  return (
    <section ref={sectionRef} className="py-32 bg-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="showcase-title mb-16 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px bg-white/30 w-20" />
            <span className="text-sm tracking-[0.3em] text-white/60 uppercase">From Our Kitchen</span>
            <div className="h-px bg-white/30 w-20" />
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-[-0.04em] text-white mb-4">
            SIGNATURE RECIPES
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Time-tested techniques. Authentic flavors. Learn to create ramen magic at home.
          </p>
        </div>

        {/* Layout: Large featured + smaller cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Large featured recipe */}
          {mainRecipe && (
            <Link
              href={`/recipes/${mainRecipe.slug}`}
              className="showcase-large-card group block lg:row-span-2"
            >
              <div className="relative h-full min-h-[600px] bg-gray-900 overflow-hidden">
                {mainRecipe.images?.[0]?.url && (
                  <Image
                    src={mainRecipe.images[0].url}
                    alt={mainRecipe.images[0].alt || mainRecipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Badge */}
                <div className="absolute top-6 left-6">
                  <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    mainRecipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    mainRecipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {mainRecipe.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs tracking-wider uppercase mb-4">
                      Featured Recipe
                    </span>
                  </div>

                  <h3 className="text-4xl md:text-5xl font-black text-white mb-4 group-hover:underline underline-offset-8">
                    {mainRecipe.title}
                  </h3>

                  {mainRecipe.description && (
                    <p className="text-white/90 text-lg mb-6 line-clamp-2">
                      {mainRecipe.description}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-white/80">
                    {mainRecipe.servings && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{mainRecipe.servings} servings</span>
                      </div>
                    )}
                    <span>•</span>
                    <span>{mainRecipe.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Smaller recipe cards */}
          <div className="showcase-grid space-y-8">
            {otherRecipes.slice(0, 3).map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="showcase-small-card group block"
              >
                <div className="grid grid-cols-5 gap-6 bg-white/5 hover:bg-white/10 transition-colors overflow-hidden">
                  {/* Image */}
                  <div className="col-span-2 relative aspect-square bg-gray-900">
                    {recipe.images?.[0]?.url && (
                      <Image
                        src={recipe.images[0].url}
                        alt={recipe.images[0].alt || recipe.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 40vw, 20vw"
                      />
                    )}

                    {/* Difficulty badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold uppercase ${
                      recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {recipe.difficulty}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="col-span-3 py-4 pr-4 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:underline underline-offset-4">
                      {recipe.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-white/60">
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
        </div>

        {/* View all CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase font-bold group text-white"
          >
            <span className="relative">
              Explore All Recipes
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
