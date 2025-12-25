export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  date: string;
  notes?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ClassAttendance {
  id: string;
  classId: string;
  className: string;
  sessionDate: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  checkedIn: boolean;
  checkInTime?: string;
  checkInMethod?: 'qr' | 'manual';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  supplierId?: string;
  supplierName?: string;
  lastRestocked?: string;
  nextRestockDate?: string;
  costPerUnit: number;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  rating: number;
  notes?: string;
}

export interface RestockOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    costPerUnit: number;
  }[];
  totalCost: number;
  status: 'draft' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  orderedBy: string;
  orderedAt: string;
  expectedDelivery?: string;
  receivedAt?: string;
  notes?: string;
}
