'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProductCategory, PRODUCT_CATEGORIES } from '@/types/product';
import MultiImageUpload, { UploadedImage } from '@/components/ui/MultiImageUpload';

interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  size: string;
  packQuantity: number;
  price: number;
  stock: number;
  active: boolean;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('ramen-bowl');
  const [priceRegular, setPriceRegular] = useState('0.00');
  const [priceBulk, setPriceBulk] = useState('');
  const [stock, setStock] = useState('0');
  const [unit, setUnit] = useState('units');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([
    { url: '', alt: '', isPrimary: true }
  ]);

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    sku: '',
    size: '',
    packQuantity: 3,
    price: 0,
    stock: 0,
    active: true,
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) {
      router.push('/login?redirect=/manage-products');
    }
  }, [isAuthenticated, isEmployee, isLoading, router]);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setProductId(id);

        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        const product = data.product;

        // Populate form with existing data
        setName(product.name || '');
        setSlug(product.slug || '');
        setDescription(product.description || '');
        setCategory(product.category);
        setPriceRegular(product.price_regular?.toFixed(2) || '0.00');
        setPriceBulk(product.price_bulk?.toFixed(2) || '');
        setStock(product.stock?.toString() || '0');
        setUnit(product.unit || 'units');
        setLowStockThreshold(product.low_stock_threshold?.toString() || '5');
        setActive(product.active);
        setFeatured(product.featured || product.is_featured || false);

        // Set images
        if (product.images && product.images.length > 0) {
          setImages(product.images);
        }

        // Load variants
        try {
          const variantsResponse = await fetch(`/api/products/${id}/variants`);
          if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json();
            if (variantsData.variants) {
              setVariants(variantsData.variants.map((v: any) => ({
                id: v.id,
                name: v.name,
                sku: v.sku,
                size: v.size || '',
                packQuantity: v.pack_quantity || v.packQuantity || 0,
                price: parseFloat(v.price),
                stock: v.stock || 0,
                active: v.active,
              })));
            }
          }
        } catch (err) {
          console.error('Error loading variants:', err);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading product:', error);
        alert('Failed to load product');
        router.push('/manage-products');
      }
    };

    if (!isLoading && isAuthenticated && isEmployee) {
      loadProduct();
    }
  }, [params, isLoading, isAuthenticated, isEmployee, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validImages = images.filter(img => img.url);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          category,
          price_regular: parseFloat(priceRegular),
          price_bulk: priceBulk ? parseFloat(priceBulk) : null,
          stock: parseInt(stock),
          unit,
          low_stock_threshold: parseInt(lowStockThreshold),
          images: validImages,
          active,
          featured,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/manage-products');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name || !newVariant.size) {
      alert('Please fill in all required fields (Name, Size)');
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVariant.name,
          size: newVariant.size,
          pack_quantity: newVariant.packQuantity,
          price: newVariant.price,
          stock: newVariant.stock,
          active: newVariant.active,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVariants([...variants, {
          id: data.variant.id,
          name: newVariant.name,
          sku: '',
          size: newVariant.size,
          packQuantity: newVariant.packQuantity,
          price: newVariant.price,
          stock: newVariant.stock,
          active: newVariant.active,
        }]);
        setNewVariant({
          name: '',
          sku: '',
          size: '',
          packQuantity: 3,
          price: 0,
          stock: 0,
          active: true,
        });
        setShowAddVariant(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Failed to add variant');
    }
  };

  const handleUpdateVariant = async (variantId: string, updates: Partial<ProductVariant>) => {
    try {
      const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          size: updates.size,
          pack_quantity: updates.packQuantity,
          price: updates.price,
          stock: updates.stock,
          active: updates.active,
        }),
      });

      if (response.ok) {
        setVariants(variants.map(v => v.id === variantId ? { ...v, ...updates } : v));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Failed to update variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVariants(variants.filter(v => v.id !== variantId));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Failed to delete variant');
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
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black mb-2">Edit Product</h1>
          <p className="text-sm text-gray-500">
            Update product details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black mb-5 text-black">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Spicy Miso Ramen Bowl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all font-mono text-sm"
                  placeholder="spicy-miso-ramen-bowl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('-', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black mb-5 text-black">Pricing & Stock</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceRegular}
                      onChange={(e) => setPriceRegular(e.target.value)}
                      required
                      min="0"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Bulk Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceBulk}
                      onChange={(e) => setPriceBulk(e.target.value)}
                      min="0"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="units"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-black">Variants</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Different sizes and pack quantities
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVariant(!showAddVariant)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {showAddVariant ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {/* Add New Variant Form */}
            {showAddVariant && (
              <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200">
                <h3 className="text-lg font-black mb-4">Add New Variant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Variant Name *
                    </label>
                    <input
                      type="text"
                      value={newVariant.name}
                      onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                      placeholder="e.g., 1.75mm - 3 Pack"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Size *
                    </label>
                    <input
                      type="text"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                      placeholder="e.g., 1.75mm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Pack Quantity *
                    </label>
                    <input
                      type="number"
                      value={newVariant.packQuantity}
                      onChange={(e) => setNewVariant({ ...newVariant, packQuantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="newVariantActive"
                    checked={newVariant.active}
                    onChange={(e) => setNewVariant({ ...newVariant, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="newVariantActive" className="text-sm font-bold text-gray-900">
                    Active (visible to customers)
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="mt-4 px-6 py-2 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  Add Variant
                </button>
              </div>
            )}

            {/* Existing Variants */}
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Pack Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.packQuantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${variant.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                            variant.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {variant.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <button
                            type="button"
                            onClick={() => handleUpdateVariant(variant.id!, { active: !variant.active })}
                            className="text-gray-600 hover:text-black hover:underline mr-3"
                          >
                            {variant.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id!)}
                            className="text-red-600 hover:text-red-800 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No variants yet. Click &quot;Add Variant&quot; to create different sizes and pack quantities.
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black mb-4 text-black">Images</h2>
            <MultiImageUpload
              images={images}
              onChange={setImages}
              folder="products"
              maxImages={8}
            />
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black mb-4 text-black">Settings</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    Active
                  </span>
                  <p className="text-xs text-gray-500">
                    Visible on website
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900">
                    Featured
                  </span>
                  <p className="text-xs text-gray-500">
                    Highlight on homepage
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 sticky bottom-4 bg-gray-50 p-4 -mx-4 rounded-xl border border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-black text-white font-bold text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
