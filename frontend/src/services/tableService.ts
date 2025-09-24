import apiClient from './apiClient';

// Enums untuk type safety
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_ORDER = 'out_of_order'
}

export enum TableArea {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  VIP = 'vip',
  SMOKING = 'smoking',
  NON_SMOKING = 'non_smoking',
  SECOND_FLOOR = 'second_floor',
  TERRACE = 'terrace'
}

export interface Table {
  table_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  area: string;
  location_description?: string;
  position_x?: number;
  position_y?: number;
  is_active: boolean;
  notes?: string;
  reserved_customer_name?: string;
  reserved_customer_phone?: string;
  reserved_from?: string;
  reserved_until?: string;
  reserved_guest_count?: number;
  occupied_since?: string;
  current_guest_count?: number;
  current_order_id?: string;
  total_usage_count?: number;
  total_revenue?: number;
  last_occupied_at?: string;
  average_usage_duration_minutes?: number;
  last_cleaned_at?: string;
  last_cleaned_by?: string;
  next_maintenance_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TableUsageHistory {
  usage_id: string;
  table_id: string;
  order_id?: string;
  customer_name?: string;
  customer_phone?: string;
  guest_count: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  total_order_amount: number;
  total_payment_amount: number;
  usage_type?: string;
  notes?: string;
  waiter_assigned?: string;
  order_placed_at?: string;
  food_served_at?: string;
  payment_completed_at?: string;
  created_at: string;
}

export interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  out_of_order: number;
  by_area: Array<{ area: string; count: number }>;
  by_capacity: Array<{ capacity: number; count: number }>;
}

export interface QRCodeData {
  qr_id: string;
  qr_code_value: string;
  table_id: string;
  qr_type?: string;
  additional_data?: any;
  is_active: boolean;
  expires_at?: string;
  scan_count: number;
  last_scanned_at?: string;
  generated_at: string;
}

export interface CreateTableRequest {
  table_number: string;
  capacity: number;
  area?: string;
  location_description?: string;
  position_x?: number;
  position_y?: number;
  notes?: string;
}

export interface UpdateTableRequest {
  table_number?: string;
  capacity?: number;
  area?: string;
  location_description?: string;
  position_x?: number;
  position_y?: number;
  notes?: string;
}

export interface UpdateTableStatusRequest {
  status: string;
  guest_count?: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  reserved_from?: string;
  reserved_until?: string;
  cleaned_by?: string;
}

export interface TableFilters {
  status?: string;
  area?: string;
  capacity_min?: number;
  capacity_max?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export class TableService {
  private static readonly BASE_URL = '/tables';

  static async getAllTables(filters?: TableFilters): Promise<PaginatedResponse<Table>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;
    
    const response = await apiClient.get<PaginatedResponse<Table>>(url);
    return response.data;
  }

  static async getTableById(id: string): Promise<ApiResponse<Table>> {
    const response = await apiClient.get<ApiResponse<Table>>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createTable(data: CreateTableRequest): Promise<ApiResponse<Table>> {
    const response = await apiClient.post<ApiResponse<Table>>(this.BASE_URL, data);
    return response.data;
  }

  static async updateTable(id: string, data: UpdateTableRequest): Promise<ApiResponse<Table>> {
    const response = await apiClient.put<ApiResponse<Table>>(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  static async deleteTable(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async updateTableStatus(id: string, data: UpdateTableStatusRequest): Promise<ApiResponse<Table>> {
    const response = await apiClient.patch<ApiResponse<Table>>(`${this.BASE_URL}/${id}/status`, data);
    return response.data;
  }

  static async getTableQRCode(id: string): Promise<ApiResponse<QRCodeData>> {
    const response = await apiClient.get<ApiResponse<QRCodeData>>(`${this.BASE_URL}/${id}/qr-code`);
    return response.data;
  }

  static async getTableUsageHistory(
    id: string, 
    filters?: { start_date?: string; end_date?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<TableUsageHistory>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/${id}/usage-history?${queryString}` 
      : `${this.BASE_URL}/${id}/usage-history`;
    
    const response = await apiClient.get<PaginatedResponse<TableUsageHistory>>(url);
    return response.data;
  }

  static async getTableStats(): Promise<ApiResponse<TableStats>> {
    const response = await apiClient.get<ApiResponse<TableStats>>(`${this.BASE_URL}/stats`);
    return response.data;
  }

  static async getTablesDashboard(): Promise<ApiResponse<{
    tables: Table[];
    statistics: TableStats;
    recent_activity: TableUsageHistory[];
  }>> {
    const response = await apiClient.get<ApiResponse<{
      tables: Table[];
      statistics: TableStats;
      recent_activity: TableUsageHistory[];
    }>>(`${this.BASE_URL}/dashboard`);
    return response.data;
  }

  // Utility methods
  static getStatusColor(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
    const statusColors = {
      available: 'success',
      occupied: 'error',
      reserved: 'warning',
      cleaning: 'info',
      out_of_order: 'default'
    } as const;
    
    return statusColors[status as keyof typeof statusColors] || 'default';
  }

  static getStatusIcon(status: string): string {
    const statusIcons = {
      available: '✅',
      occupied: '🔴',
      reserved: '🟡',
      cleaning: '🧹',
      out_of_order: '⚠️'
    };
    
    return statusIcons[status as keyof typeof statusIcons] || '❓';
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static calculateUtilizationRate(occupied: number, reserved: number, total: number): number {
    if (total === 0) return 0;
    return Math.round(((occupied + reserved) / total) * 100);
  }

  static isTableAvailable(table: Table): boolean {
    return table.status === 'available' && table.is_active;
  }

  static canUpdateTableStatus(currentStatus: string, newStatus: string): boolean {
    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      available: ['occupied', 'reserved', 'cleaning', 'out_of_order'],
      occupied: ['available', 'cleaning'],
      reserved: ['available', 'occupied', 'cleaning'],
      cleaning: ['available'],
      out_of_order: ['available', 'cleaning']
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static getAreaDisplayName(area: string): string {
    const areaNames: Record<string, string> = {
      indoor: 'Indoor',
      outdoor: 'Outdoor',
      vip: 'VIP',
      smoking: 'Smoking Area',
      non_smoking: 'Non-Smoking Area',
      second_floor: 'Second Floor',
      terrace: 'Terrace'
    };

    return areaNames[area] || area;
  }

  static validateTableNumber(tableNumber: string): string | null {
    if (!tableNumber || tableNumber.trim().length === 0) {
      return 'Table number is required';
    }
    
    if (tableNumber.length < 2 || tableNumber.length > 20) {
      return 'Table number must be between 2 and 20 characters';
    }
    
    // Check if it contains only alphanumeric characters and hyphens
    if (!/^[A-Za-z0-9\-]+$/.test(tableNumber)) {
      return 'Table number can only contain letters, numbers, and hyphens';
    }
    
    return null;
  }

  static validateCapacity(capacity: number): string | null {
    if (!capacity || capacity < 1) {
      return 'Capacity must be at least 1';
    }
    
    if (capacity > 20) {
      return 'Capacity cannot exceed 20';
    }
    
    return null;
  }

  static validateReservationTime(from: string, until: string): string | null {
    if (!from || !until) {
      return 'Both start and end times are required for reservations';
    }
    
    const fromDate = new Date(from);
    const untilDate = new Date(until);
    const now = new Date();
    
    if (fromDate < now) {
      return 'Reservation start time cannot be in the past';
    }
    
    if (untilDate <= fromDate) {
      return 'Reservation end time must be after start time';
    }
    
    const durationHours = (untilDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > 8) {
      return 'Reservation duration cannot exceed 8 hours';
    }
    
    return null;
  }
}
