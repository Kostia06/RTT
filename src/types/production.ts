export interface ProductionItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  case_size: number;
  low_stock_threshold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fridge {
  id: string;
  name: string;
  qr_code: string;
  location?: string;
  max_capacity_cases?: number;
  max_capacity_portions?: number;
  temperature_log_required: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftProductionAssignment {
  id: string;
  shift_id: string;
  production_item_id: string;
  bins_required: number;
  target_portions?: number;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  // Joined fields
  production_item?: ProductionItem;
}

export interface ProductionLog {
  id: string;
  shift_id: string;
  employee_id: string;
  production_item_id: string;
  cases_made: number;
  loose_portions: number;
  total_portions?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
  // Joined fields
  production_item?: ProductionItem;
  employee_name?: string;
}

export interface FridgeInventory {
  id: string;
  fridge_id: string;
  production_item_id: string;
  cases: number;
  loose_portions: number;
  batch_date: string;
  expiration_date: string;
  last_updated_by?: string;
  last_updated_at: string;
  created_at: string;
  // Joined fields
  production_item?: ProductionItem;
  fridge?: Fridge;
}

export interface FridgeTemperatureLog {
  id: string;
  fridge_id: string;
  employee_id: string;
  shift_id?: string;
  temperature: number;
  notes?: string;
  logged_at: string;
  created_at: string;
  // Joined fields
  fridge?: Fridge;
  employee_name?: string;
}

export interface StorageTransaction {
  id: string;
  fridge_id: string;
  production_item_id: string;
  transaction_type: 'add' | 'remove' | 'adjust' | 'transfer';
  cases_change: number;
  portions_change: number;
  employee_id: string;
  shift_id?: string;
  notes?: string;
  logged_at: string;
  created_at: string;
  // Joined fields
  fridge?: Fridge;
  production_item?: ProductionItem;
  employee_name?: string;
}

export interface FridgeInventorySummary {
  fridge: Fridge;
  items: FridgeInventory[];
  total_cases: number;
  total_portions: number;
  capacity_used_cases?: number;
  capacity_used_portions?: number;
}

export interface ProductionSummary {
  production_item: ProductionItem;
  total_cases: number;
  total_portions: number;
  fridges: {
    fridge_id: string;
    fridge_name: string;
    cases: number;
    portions: number;
    partial_case?: boolean;
  }[];
  is_low_stock: boolean;
}
