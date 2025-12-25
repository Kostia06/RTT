'use client';

import { use, useEffect, useState } from 'react';
import { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-900">
        {recipe.images.length > 0 && recipe.images[0].url ? (
          <img
            src={recipe.images[0].url}
            alt={recipe.images[0].alt || recipe.title}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-xl">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {recipe.difficulty}
            </span>
            {recipe.featured && (
              <span className="px-3 py-1 text-sm font-medium rounded bg-black text-white">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-gray-600 text-lg mb-6">{recipe.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 py-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Servings</p>
              <p className="text-lg font-semibold">{recipe.servings}</p>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {recipe.images.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recipe.images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.url}
                    alt={image.alt || `${recipe.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <span className="font-medium">{ingredient.amount} {ingredient.unit || ''}</span>{' '}
                  <span>{ingredient.name}</span>
                  {ingredient.notes && (
                    <span className="text-gray-500 text-sm ml-2">({ingredient.notes})</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Instructions</h2>
          <ol className="space-y-6">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {instruction.step}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{instruction.instruction}</p>
                  {instruction.duration && (
                    <p className="text-sm text-gray-500 mt-1">⏱ {instruction.duration} minutes</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {recipe.tips && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tips & Notes
            </h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{recipe.tips}</p>
          </div>
        )}

        {/* Nutritional Info */}
        {recipe.nutritional_info && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Nutritional Information</h2>
            <p className="text-sm text-gray-500 mb-4">Per serving</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(recipe.nutritional_info).map(([key, value]) => (
                value !== undefined && (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 capitalize">{key}</p>
                    <p className="text-lg font-semibold">{value}{key === 'calories' ? '' : 'g'}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="pb-12">
          <button
            onClick={() => router.push('/recipes')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Back to Recipes
          </button>
        </div>
      </div>
    </div>
  );
}
