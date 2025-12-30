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
  const [currentSlide, setCurrentSlide] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-play carousel
  useEffect(() => {
    if (loading || recipes.length <= 1) return;

    const otherRecipesCount = recipes.length - 1; // Exclude main recipe

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % otherRecipesCount);
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    // Intersection Observer to start/stop autoplay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoplay();
          } else {
            stopAutoplay();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      stopAutoplay();
      observer.disconnect();
    };
  }, [loading, recipes]);

  // Scroll to current slide
  useEffect(() => {
    if (carouselRef.current && recipes.length > 1) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const itemWidth = scrollWidth / (recipes.length - 1);
      carouselRef.current.scrollTo({
        left: itemWidth * currentSlide,
        behavior: 'smooth',
      });
    }
  }, [currentSlide, recipes]);

  const nextSlide = () => {
    const otherRecipesCount = recipes.length - 1;
    setCurrentSlide((prev) => (prev + 1) % otherRecipesCount);
  };

  const prevSlide = () => {
    const otherRecipesCount = recipes.length - 1;
    setCurrentSlide((prev) => (prev - 1 + otherRecipesCount) % otherRecipesCount);
  };

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
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Header */}
        <div className="showcase-title mb-16 text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px bg-white/30 w-20" />
            <span className="text-sm tracking-[0.3em] text-white/60 uppercase">From Our Kitchen</span>
            <div className="h-px bg-white/30 w-20" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white mb-4 break-words">
            SIGNATURE RECIPES
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Time-tested techniques. Authentic flavors. Learn to create ramen magic at home.
          </p>
        </div>

        {/* Layout: Large featured + smaller cards */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Large featured recipe */}
          {mainRecipe && (
            <Link
              href={`/recipes/${mainRecipe.slug}`}
              className="showcase-large-card group block lg:row-span-2"
            >
              <div className="relative h-full min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] bg-gray-900 overflow-hidden">
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
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    mainRecipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    mainRecipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                    'bg-red-500 text-white'
                  }`}>
                    {mainRecipe.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="mb-3 sm:mb-4">
                    <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-sm text-white text-[10px] sm:text-xs tracking-wider uppercase mb-3 sm:mb-4">
                      Featured Recipe
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 group-hover:underline underline-offset-8 break-words">
                    {mainRecipe.title}
                  </h3>

                  {mainRecipe.description && (
                    <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 line-clamp-2">
                      {mainRecipe.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/80 flex-wrap">
                    {mainRecipe.servings && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{mainRecipe.servings} servings</span>
                      </div>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <span>{mainRecipe.ingredients.length} ingredients</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Smaller recipe cards - carousel on mobile, stacked on desktop */}
          <div className="showcase-grid">
            {/* Mobile carousel */}
            <div className="lg:hidden relative">
              <div
                ref={carouselRef}
                className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-4"
              >
                <div className="flex gap-6 pl-[7.5vw] pr-[7.5vw] sm:pl-[15vw] sm:pr-[15vw]">
                {otherRecipes.slice(0, 3).map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipes/${recipe.slug}`}
                    className="showcase-small-card group block w-[85vw] sm:w-[70vw] snap-center flex-shrink-0"
                  >
                    <div className="grid grid-cols-5 gap-6 bg-white/5 hover:bg-white/10 transition-colors overflow-hidden h-full">
                      {/* Image */}
                      <div className="col-span-2 relative aspect-square bg-gray-900">
                        {recipe.images?.[0]?.url && (
                          <Image
                            src={recipe.images[0].url}
                            alt={recipe.images[0].alt || recipe.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="40vw"
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

              {/* Navigation Buttons - only show if more than 1 recipe */}
              {otherRecipes.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-black flex items-center justify-center hover:bg-white transition-colors z-10"
                    aria-label="Previous slide"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 text-black flex items-center justify-center hover:bg-white transition-colors z-10"
                    aria-label="Next slide"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Scroll indicator dots */}
                  <div className="mt-6 flex justify-center gap-2">
                    {otherRecipes.slice(0, 3).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide ? 'bg-white w-8' : 'bg-white/20'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Desktop stacked cards */}
            <div className="hidden lg:block space-y-8">
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
