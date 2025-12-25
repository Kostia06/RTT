import { CartItem } from '@/components/providers/CartProvider';

// Delivery Methods
export type DeliveryMethod = 'pickup' | 'delivery' | 'shipping';

export interface DeliveryOption {
  method: DeliveryMethod;
  label: string;
  description: string;
  price: number;
  availableTimeSlots?: string[];
}

// Delivery Time Slots
export const DELIVERY_TIME_SLOTS = [
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
];

// Pickup Address
export const PICKUP_ADDRESS = {
  street: '4093 Ogden Rd SE',
  city: 'Calgary',
  province: 'AB',
  postalCode: '',
  country: 'Canada',
};

// Customer Information
export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

// Delivery Address
export interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// Checkout Data
export interface CheckoutData {
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryTimeSlot?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  notes?: string;
}

// Order Status
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Payment Status
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Order
export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryTimeSlot?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
