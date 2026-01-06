'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Recipe } from '@/types/recipe';

interface ProductWithVariants extends Product {
  variantCount?: number;
}

export default function ManageContentPage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'recipes'>('products');
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all');
  const [recipeFilter, setRecipeFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-content');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchProducts();
      fetchRecipes();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      if (data.products) {
        const productsWithVariants = await Promise.all(
          data.products.map(async (product: Product) => {
            try {
              const variantsResponse = await fetch(`/api/products/${product.id}/variants`);
              const variantsData = await variantsResponse.json();
              return {
                ...product,
                variantCount: variantsData.variants?.length || 0,
              };
            } catch (err) {
              return { ...product, variantCount: 0 };
            }
          })
        );
        setProducts(productsWithVariants);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=100');
      const data = await response.json();
      if (data.recipes) {
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleDeleteRecipe = async (recipeId: string, recipeName: string) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Recipe deleted successfully!');
        fetchRecipes();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const filteredProducts = products.filter(product => {
    if (productFilter === 'active') return product.active;
    if (productFilter === 'inactive') return !product.active;
    if (productFilter === 'low-stock') return product.stock <= product.low_stock_threshold;
    return true;
  });

  const filteredRecipes = recipes.filter(recipe => {
    if (recipeFilter === 'active') return recipe.active;
    if (recipeFilter === 'inactive') return !recipe.active;
    return true;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.low_stock_threshold);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Manage Content
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Products and recipes in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'products'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recipes')}
              className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'recipes'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recipes ({recipes.length})
            </button>
          </div>

          {/* Stats Cards */}
          {activeTab === 'products' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-black mb-1">{products.length}</div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-green-600 mb-1">{products.filter(p => p.active).length}</div>
                <div className="text-xs text-gray-500 font-medium">Active</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-yellow-600 mb-1">{products.filter(p => p.featured).length}</div>
                <div className="text-xs text-gray-500 font-medium">Featured</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-red-600 mb-1">{lowStockProducts.length}</div>
                <div className="text-xs text-gray-500 font-medium">Low Stock</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-black mb-1">{recipes.length}</div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-green-600 mb-1">{recipes.filter(r => r.active).length}</div>
                <div className="text-xs text-gray-500 font-medium">Active</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-yellow-600 mb-1">{recipes.filter(r => r.featured).length}</div>
                <div className="text-xs text-gray-500 font-medium">Featured</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-2xl font-black text-orange-600 mb-1">
                  {recipes.filter(r => r.difficulty === 'Easy').length}
                </div>
                <div className="text-xs text-gray-500 font-medium">Easy</div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap flex-1">
              {activeTab === 'products' ? (
                <>
                  <button
                    onClick={() => setProductFilter('all')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      productFilter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setProductFilter('active')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      productFilter === 'active'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setProductFilter('inactive')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      productFilter === 'inactive'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                  <button
                    onClick={() => setProductFilter('low-stock')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      productFilter === 'low-stock'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Low Stock
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRecipeFilter('all')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      recipeFilter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRecipeFilter('active')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      recipeFilter === 'active'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setRecipeFilter('inactive')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      recipeFilter === 'inactive'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </>
              )}
            </div>

            {/* Add Button */}
            <Link
              href={activeTab === 'products' ? '/manage-products/create' : '/manage-recipes/create'}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors rounded-lg whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add {activeTab === 'products' ? 'Product' : 'Recipe'}
            </Link>
          </div>

        {/* Content Grid */}
        {activeTab === 'products' ? (
          filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first product</p>
              <Link
                href="/manage-products/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {!product.active && (
                        <span className="px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          Inactive
                        </span>
                      )}
                      {product.featured && (
                        <span className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                          Featured
                        </span>
                      )}
                      {product.stock <= product.low_stock_threshold && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-1">{product.name}</h3>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-black text-black">${product.price_regular.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500 font-medium">Price</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className={`text-sm font-black ${
                          product.stock <= product.low_stock_threshold ? 'text-red-600' : 'text-black'
                        }`}>
                          {product.stock}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">Stock</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-black text-black">{product.variantCount || 0}</div>
                        <div className="text-[10px] text-gray-500 font-medium">Variants</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/manage-products/edit/${product.id}`}
                        className="flex-1 px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors text-center"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/shop/${product.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        title="View product page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No recipes yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first recipe</p>
              <Link
                href="/manage-recipes/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create First Recipe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {recipe.images.length > 0 ? (
                      <img
                        src={recipe.images[0].url}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {!recipe.active && (
                        <span className="px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          Inactive
                        </span>
                      )}
                      {recipe.featured && (
                        <span className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{recipe.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{recipe.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-black text-black">{recipe.servings}</div>
                        <div className="text-[10px] text-gray-500 font-medium">Servings</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-black text-black">
                          {recipe.instructions?.reduce((sum, inst) => sum + (inst.duration || 0), 0) || '-'}
                          {recipe.instructions?.reduce((sum, inst) => sum + (inst.duration || 0), 0) ? 'm' : ''}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">Total Time</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-black text-black">{recipe.instructions?.length || 0}</div>
                        <div className="text-[10px] text-gray-500 font-medium">Steps</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/manage-recipes/edit/${recipe.id}`}
                        className="flex-1 px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors text-center"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        title="View recipe page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete recipe"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Floating Action Button (Mobile) */}
        <Link
          href={activeTab === 'products' ? '/manage-products/create' : '/manage-recipes/create'}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label={`Create new ${activeTab === 'products' ? 'product' : 'recipe'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
