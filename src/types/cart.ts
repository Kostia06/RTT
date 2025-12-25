import { Product } from './product';

// Cart Item
export interface CartItem {
  id: string; // Unique cart item ID (product_id + variant)
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
  notes?: string;
}

// Cart State
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Cart Actions
export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  getItem: (itemId: string) => CartItem | undefined;
}

// Cart Context Type
export interface CartContextType extends Cart, CartActions {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}
