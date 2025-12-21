export type ProductCategory = 'ramen-bowl' | 'retail-product' | 'merchandise' | 'ingredient';

export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';
export type ProductSize = 'regular' | 'large';

export interface ProductImage {
  id?: string;
  product_id?: string;
  url: string;
  alt: string;
  is_primary: boolean;
  sort_order?: number;
}

export interface ProductVariantOptions {
  spiceLevel?: SpiceLevel;
  size?: ProductSize;
  [key: string]: string | undefined;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: ProductVariantOptions;
  created_at?: string;
}

export interface NutritionalInfo {
  id?: string;
  product_id?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
}

export interface InventoryData {
  id?: string;
  product_id?: string;
  track_inventory: boolean;
  current_stock: number;
  low_stock_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category: ProductCategory;
  price: number;
  compare_at_price?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  nutritional_info?: NutritionalInfo;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  is_featured: boolean;
  inventory_data?: InventoryData;
  created_at: string;
  updated_at: string;
}
