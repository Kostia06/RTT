'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Product } from '@/types/product';
import Link from 'next/link';

export default function ProductsManagePage() {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-products');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchProducts();
    }
  }, [isAuthenticated, isEmployee]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'active') return product.active;
    if (filter === 'inactive') return !product.active;
    if (filter === 'low-stock') return product.stock <= product.low_stock_threshold;
    return true;
  });

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts(); // Reload the list
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= p.low_stock_threshold);

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-black">Manage Products</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory and catalog</p>
          </div>
          <Link
            href="/manage-products/create"
            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors text-center whitespace-nowrap"
          >
            + Create Product
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 border-l-4 border-black">
            <div className="text-2xl font-black text-black">{products.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Total Products</div>
          </div>
          <div className="bg-gray-50 p-4 border-l-4 border-green-500">
            <div className="text-2xl font-black text-black">{products.filter(p => p.active).length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Active</div>
          </div>
          <div className="bg-gray-50 p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-black text-black">{products.filter(p => p.featured).length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Featured</div>
          </div>
          <div className="bg-gray-50 p-4 border-l-4 border-red-500">
            <div className="text-2xl font-black text-black">{lowStockProducts.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">Low Stock</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'active'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({products.filter(p => p.active).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'inactive'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive ({products.filter(p => !p.active).length})
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'low-stock'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock ({lowStockProducts.length})
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found. Create your first product!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images.length > 0 && (
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 mr-3">
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-10 w-10 object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </div>
                          {product.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-black text-white">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price_regular.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock <= product.low_stock_threshold
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {product.stock} {product.unit}
                      </span>
                      {product.stock <= product.low_stock_threshold && (
                        <div className="text-xs text-red-500">Low Stock!</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="text-black hover:underline mr-4"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link
                        href={`/manage-products/edit/${product.id}`}
                        className="text-gray-600 hover:text-black hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
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
          href="/manage-products/create"
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center z-50"
          aria-label="Create new product"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
