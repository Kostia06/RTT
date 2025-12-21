'use client';

import { ProductCategory } from '@/types';

interface ProductFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories: { value: ProductCategory | ''; label: string }[] = [
  { value: '', label: 'All Products' },
  { value: 'ramen-bowl', label: 'Ramen Bowls' },
  { value: 'retail-product', label: 'Retail Products' },
  { value: 'merchandise', label: 'Merchandise' },
];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
            selectedCategory === category.value
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-black'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
