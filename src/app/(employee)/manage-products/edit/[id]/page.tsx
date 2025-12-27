'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProductCategory, PRODUCT_CATEGORIES } from '@/types/product';
import MultiImageUpload, { UploadedImage } from '@/components/ui/MultiImageUpload';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
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
        setName(product.name);
        setSlug(product.slug);
        setSku(product.sku);
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
          sku,
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-2">
            Edit Product
          </h1>
          <p className="text-gray-600">
            Update product details and save changes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              Basic Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  placeholder="e.g., Spicy Miso Ramen Bowl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                    placeholder="e.g., spicy-miso-ramen-bowl"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    This is the product&apos;s URL. Be careful when changing it.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                    placeholder="e.g., RMN-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base resize-none"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('-', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              Pricing & Inventory
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Regular Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceRegular}
                      onChange={(e) => setPriceRegular(e.target.value)}
                      required
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Bulk Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceBulk}
                      onChange={(e) => setPriceBulk(e.target.value)}
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                    placeholder="e.g., units, kg, lbs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Low Stock Alert *
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-black transition-colors text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              Product Images
            </h2>
            <MultiImageUpload
              images={images}
              onChange={setImages}
              folder="products"
              maxImages={8}
            />
          </div>

          {/* Settings */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold">
                4
              </span>
              Publishing Settings
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-base font-bold text-gray-900 group-hover:text-black">
                    Active (Visible on Website)
                  </span>
                  <p className="text-sm text-gray-600 mt-0.5">
                    When checked, this product will be visible to all visitors
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <div>
                  <span className="text-base font-bold text-gray-900 group-hover:text-black">
                    Featured Product
                  </span>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Featured products will be highlighted on the homepage
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-black text-white font-black text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-base hover:border-black hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
