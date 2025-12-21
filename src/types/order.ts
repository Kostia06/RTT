import { ProductVariantOptions } from './product';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'square' | 'cash';
export type FulfillmentType = 'delivery' | 'pickup';
export type FulfillmentStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

export interface OrderCustomer {
  user_id?: string;
  email: string;
  name: string;
  phone?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  variant_id?: string;
  quantity: number;
  price: number;
  options?: ProductVariantOptions;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  square_payment_id?: string;
  square_order_id?: string;
  status: PaymentStatus;
  transaction_date?: string;
}

export interface OrderFulfillment {
  status: FulfillmentStatus;
  type: FulfillmentType;
  scheduled_date?: string;
  notes?: string;
}

export interface IOrder {
  id: string;
  order_number: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  payment: OrderPayment;
  fulfillment: OrderFulfillment;
  status: OrderStatus;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}
