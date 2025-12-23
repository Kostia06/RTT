'use client';

import { useCart } from '@/components/providers/CartProvider';

interface CartIconProps {
  scrolled?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({ scrolled = true }) => {
  const { toggleCart, itemCount } = useCart();

  return (
    <button
      onClick={toggleCart}
      className={`relative group transition-colors duration-300 ${
        scrolled ? 'text-black hover:text-gray-700' : 'text-white/90 hover:text-white'
      }`}
      aria-label="Open cart"
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        {/* Hover ring effect */}
        <span className={`absolute inset-0 -m-1 border rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          scrolled ? 'border-black/30' : 'border-white/40'
        }`} />
      </div>

      {itemCount > 0 && (
        <span className={`absolute -top-2 -right-2 text-xs font-bold w-5 h-5 flex items-center justify-center transition-colors duration-300 rounded-full ${
          scrolled
            ? 'bg-black text-white'
            : 'bg-white text-black'
        }`}>
          {itemCount > 99 ? '99' : itemCount}
        </span>
      )}
    </button>
  );
};
