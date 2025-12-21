export type UserRole = 'customer' | 'employee' | 'admin';

export type AddressType = 'shipping' | 'billing';

export interface Address {
  id?: string;
  type: AddressType;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface EmployeeData {
  id?: string;
  position?: string;
  hire_date?: string;
  hourly_rate?: number;
  employee_id?: string;
  qr_code?: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  password: string;
  phone?: string;
  role: UserRole;
  email_verified?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

// Client-safe user type (without password)
export interface SafeUser extends Omit<IUser, 'password'> {}
