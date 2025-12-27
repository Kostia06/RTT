'use client';

import { use, useEffect, useState } from 'react';
import { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isEmployee } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchRecipe();
  }, [resolvedParams.slug]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${resolvedParams.slug}`);
      const data = await response.json();

      if (data.recipe) {
        setRecipe(data.recipe);
      } else {
        router.push('/recipes');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      router.push('/recipes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const primaryImage = recipe.images.find(img => img.isPrimary) || recipe.images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-black text-white">
        <div className="absolute inset-0 overflow-hidden">
          {primaryImage?.url && (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || recipe.title}
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => router.push('/recipes')}
                className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Recipes
              </button>
              <span className="text-white/40">•</span>
              <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${
                recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                'bg-red-500 text-white'
              }`}>
                {recipe.difficulty}
              </span>
              {recipe.featured && (
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-white text-black">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              {recipe.title}
            </h1>

            {/* Description */}
            {recipe.description && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
                {recipe.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-bold text-white">{recipe.servings}</span>
                <span className="text-white/60">servings</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-white/60">{recipe.ingredients.length} ingredients</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-white/60">{recipe.instructions.length} steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Sidebar - Ingredients & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ingredients Card */}
            <div className="bg-white border-2 border-black p-6 md:p-8 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-lg">
                  🥘
                </div>
                <h2 className="text-2xl font-black tracking-tight">Ingredients</h2>
              </div>

              <div className="space-y-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-black text-white text-xs flex items-center justify-center font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base leading-relaxed">
                        <span className="font-black text-black">
                          {ingredient.amount} {ingredient.unit || ''}
                        </span>{' '}
                        <span className="text-gray-800">{ingredient.name}</span>
                      </p>
                      {ingredient.notes && (
                        <p className="text-sm text-gray-500 italic mt-1">{ingredient.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            {recipe.tips && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💡</span>
                  <h3 className="text-xl font-black tracking-tight">Pro Tips</h3>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                  {recipe.tips}
                </p>
              </div>
            )}
          </div>

          {/* Main - Instructions & Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {recipe.images.length > 0 && (
              <div className="bg-white border-2 border-gray-200 overflow-hidden">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={recipe.images[activeImageIndex]?.url || primaryImage?.url}
                    alt={recipe.images[activeImageIndex]?.alt || recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {recipe.images.length > 1 && (
                  <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {recipe.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`aspect-square overflow-hidden border-2 transition-all ${
                            activeImageIndex === index
                              ? 'border-black scale-95'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.alt || `${recipe.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white border-2 border-black p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-lg">
                  📝
                </div>
                <h2 className="text-2xl font-black tracking-tight">Instructions</h2>
              </div>

              <div className="space-y-8">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-black text-white flex items-center justify-center font-black text-xl md:text-2xl">
                        {instruction.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-2">
                        {instruction.instruction}
                      </p>
                      {instruction.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{instruction.duration} minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Info */}
            {recipe.nutritional_info && (
              <div className="bg-white border-2 border-gray-200 p-6 md:p-8">
                <h3 className="text-xl font-black tracking-tight mb-6">
                  Nutritional Information
                  <span className="block text-sm font-normal text-gray-500 mt-1">Per serving</span>
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {Object.entries(recipe.nutritional_info).map(([key, value]) => (
                    value !== undefined && (
                      <div key={key} className="text-center p-4 bg-gray-50 border border-gray-200">
                        <p className="text-2xl font-black text-black mb-1">
                          {value}
                          <span className="text-sm font-normal text-gray-500">
                            {key === 'calories' ? '' : 'g'}
                          </span>
                        </p>
                        <p className="text-xs uppercase tracking-wider text-gray-600 font-medium">
                          {key}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => router.push('/recipes')}
                className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Recipes
              </button>
              {isEmployee && recipe?.id && (
                <button
                  onClick={() => router.push(`/manage-recipes/edit/${recipe.id}`)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Recipe
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
