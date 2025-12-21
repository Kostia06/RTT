export type ClassType = 'beginner' | 'intermediate' | 'advanced' | 'specialty';
export type ClassScheduleStatus = 'scheduled' | 'completed' | 'cancelled';
export type RegistrationStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no-show';
export type RegistrationPaymentStatus = 'pending' | 'completed' | 'refunded';

export interface ClassInstructor {
  user_id?: string;
  name: string;
  bio?: string;
  image?: string;
}

export interface ClassSchedule {
  date: string;
  start_time: string;
  end_time: string;
  status: ClassScheduleStatus;
  attendees: number;
}

export interface ClassImage {
  url: string;
  alt: string;
}

export interface IClass {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  type: ClassType;
  duration: number;
  max_students: number;
  current_students: number;
  price: number;
  instructor: ClassInstructor;
  schedule: ClassSchedule[];
  images: ClassImage[];
  requirements: string[];
  what_you_will_learn: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassRegistrationStudent {
  user_id?: string;
  email: string;
  name: string;
  phone?: string;
}

export interface ClassRegistrationPayment {
  square_payment_id?: string;
  amount: number;
  status: RegistrationPaymentStatus;
}

export interface ClassRegistrationCheckIn {
  qr_code?: string;
  checked_in_at?: string;
  checked_in_by?: string;
}

export interface IClassRegistration {
  id: string;
  class_id: string;
  schedule_date: string;
  student: ClassRegistrationStudent;
  payment: ClassRegistrationPayment;
  status: RegistrationStatus;
  check_in?: ClassRegistrationCheckIn;
  notes?: string;
  dietary_restrictions?: string;
  created_at: string;
  updated_at: string;
}
