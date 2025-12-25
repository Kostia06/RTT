// Product Categories
// product-category.ts
export type ProductCategory =
  | 'ramen-bowl'
  | 'retail-product'
  | 'merchandise';

export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';



export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'ramen-bowl',
  'retail-product',
  'merchandise',
];



// product.ts
export type InventoryData = {
  productId: string;
  quantity: number;
  location?: string;
};


export type ProductVariantOptions = {
  color?: string;
  size?: string;
  [key: string]: any;
};

export type ProductSize = 'small' | 'medium' | 'large';

// Product Image
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

// Nutritional Info (stored as JSONB)
export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
  [key: string]: number | undefined;
}

// Main Product Interface (matches Supabase schema)
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  category: ProductCategory;
  images: ProductImage[];

  // Pricing
  price_regular: number;
  price_bulk?: number;
  price_cost?: number;

  // Inventory
  stock: number;
  unit: string;
  low_stock_threshold: number;

  // Additional info
  supplier?: string;
  expiry_date?: string;
  nutritional_info?: NutritionalInfo;
  cooking_instructions?: string;

  // Status
  active: boolean;
  featured: boolean;

  // Storage locations (array of UUIDs)
  storage_locations?: string[];

  created_at: string;
  updated_at: string;
}

// Product Variant
export interface ProductVariant {
  sku: string;
  name: string;
  price: number;
  stock?: number;
  options?: Record<string, string>;
}

// Legacy compatibility (for existing code)
export interface IProduct extends Product {
  price: number;
  is_active: boolean;
  is_featured: boolean;
  variants?: ProductVariant[];
}

// Cart Item
export interface CartItem {
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
}
