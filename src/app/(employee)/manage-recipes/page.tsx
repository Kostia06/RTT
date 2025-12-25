'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Recipe } from '@/types/recipe';
import Link from 'next/link';

export default function RecipesManagePage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-recipes');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchRecipes();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=100');
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

  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'active') return recipe.active;
    if (filter === 'inactive') return !recipe.active;
    return true;
  });

  const handleDelete = async (recipeId: string, recipeName: string) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Recipe deleted successfully!');
        fetchRecipes(); // Reload the list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-black">Manage Recipes</h1>
            <p className="text-gray-600 mt-2">Create and manage your recipe collection</p>
          </div>
          <Link
            href="/manage-recipes/create"
            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors text-center whitespace-nowrap"
          >
            + Create Recipe
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 border-l-4 border-black">
            <div className="text-2xl font-black text-black">{recipes.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Total Recipes</div>
          </div>
          <div className="bg-gray-50 p-4 border-l-4 border-green-500">
            <div className="text-2xl font-black text-black">{recipes.filter(r => r.active).length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Active</div>
          </div>
          <div className="bg-gray-50 p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-black text-black">{recipes.filter(r => r.featured).length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Featured</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({recipes.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'active'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({recipes.filter(r => r.active).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'inactive'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive ({recipes.filter(r => !r.active).length})
          </button>
        </div>

        {/* Recipes Table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No recipes found. Create your first recipe!
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {recipe.images.length > 0 && (
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 mr-3">
                            <img
                              src={recipe.images[0].url}
                              alt={recipe.title}
                              className="h-10 w-10 object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {recipe.title}
                          </div>
                          {recipe.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-black text-white">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recipe.servings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        recipe.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipe.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="text-black hover:underline mr-4"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link
                        href={`/manage-recipes/edit/${recipe.id}`}
                        className="text-gray-600 hover:text-black hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(recipe.id, recipe.title)}
                        className="text-red-600 hover:text-red-800 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Action Button (Mobile) */}
        <Link
          href="/manage-recipes/create"
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="Create new recipe"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
