'use client';

import { useEffect, useState, useRef } from 'react';
import { Recipe, RecipeDifficulty, RECIPE_DIFFICULTIES } from '@/types/recipe';
import Link from 'next/link';
import gsap from 'gsap';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<RecipeDifficulty | 'all'>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecipes();
  }, [selectedDifficulty, showFeaturedOnly]);

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
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedDifficulty !== 'all') {
        params.append('difficulty', selectedDifficulty);
      }

      if (showFeaturedOnly) {
        params.append('featured', 'true');
      }

      const response = await fetch(`/api/recipes?${params.toString()}`);
      const data = await response.json();

      if (data.recipes) {
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed prep_time and cook_time - no longer needed

  const title = "RAMEN RECIPES";

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
          麺
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-20 sm:py-20 sm:pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Recipes</span>
          </div>

          {/* Animated Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-none mb-4 overflow-visible py-2 break-words">
            {title.split(' ').map((word, wordIndex) => (
              <span key={wordIndex} className="block overflow-visible py-0.5 whitespace-nowrap">
                {word.split('').map((char, charIndex) => (
                  <span key={`${wordIndex}-${charIndex}`} className="hero-char inline-block will-change-transform" style={{ perspective: '1000px' }}>
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-xl md:text-2xl text-white/80 max-w-3xl leading-relaxed">
            Master the art of ramen with our curated collection of authentic recipes
          </p>

          {/* Scroll Indicator */}
          <div className="mt-8 flex items-center gap-4 text-sm text-white/60">
            <div className="w-px h-16 bg-white/20 animate-pulse" />
            <span className="uppercase tracking-wider">Scroll to explore</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Difficulty:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as RecipeDifficulty | 'all')}
                className="px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="all">All</option>
                {RECIPE_DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-gray-300" />

            {/* Featured Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Featured only
              </span>
            </label>

            <div className="ml-auto text-xs text-gray-500">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-2 h-2 bg-black rounded-full animate-ping" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-500">No recipes found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="group block"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative mb-4">
                  {recipe.images.length > 0 && recipe.images[0].url ? (
                    <img
                      src={recipe.images[0].url}
                      alt={recipe.images[0].alt || recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-6xl">麺</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>

                  {/* Difficulty badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                    recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {recipe.difficulty}
                  </div>

                  {recipe.featured && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-black text-white flex items-center justify-center">
                      <span className="text-sm">★</span>
                    </div>
                  )}

                  {/* Bottom info on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-3 text-xs">
                      {recipe.servings && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {recipe.servings}
                        </span>
                      )}
                      <span>•</span>
                      <span>{recipe.ingredients.length} ingredients</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:underline underline-offset-2">
                    {recipe.title}
                  </h3>

                  {recipe.description && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
