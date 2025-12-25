import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductDetail } from '@/components/products/ProductDetail';
import { IProduct } from '@/types';

async function getProduct(slug: string): Promise<IProduct | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${slug}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Respect the Technique`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.map((img) => ({
        url: img.url,
        alt: img.alt,
      })) || [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/shop" className="text-gray-500 hover:text-black transition-colors">
                Shop
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-gray-500 hover:text-black transition-colors capitalize"
              >
                {product.category.replace('-', ' ')}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-black font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        {/* Product Detail */}
        <ProductDetail product={product} />

        {/* Back to Shop */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black transition-colors uppercase tracking-wider"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
