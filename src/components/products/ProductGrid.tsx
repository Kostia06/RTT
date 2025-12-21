import { IProduct } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: IProduct[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products found.</p>
        <p className="text-gray-500 text-sm mt-2">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id.toString()} product={product} />
      ))}
    </div>
  );
};
