// Mock data untuk testing dan development
export const mockTables = [
  // Indoor Area
  {
    table_id: '1',
    table_number: 'T001',
    capacity: 4,
    status: 'available' as const,
    area: 'indoor',
    location_description: 'Near front window',
    position_x: 2,
    position_y: 2,
    total_usage_count: 45,
    total_revenue: 2250000,
    average_usage_duration_minutes: 75,
    last_cleaned_at: '2024-01-10T08:00:00Z',
    last_occupied_at: '2024-01-09T20:30:00Z'
  },
  {
    table_id: '2',
    table_number: 'T002',
    capacity: 2,
    status: 'occupied' as const,
    area: 'indoor',
    location_description: 'Center area',
    current_guest_count: 2,
    occupied_since: '2024-01-10T12:30:00Z',
    position_x: 4,
    position_y: 2,
    total_usage_count: 60,
    total_revenue: 1800000,
    average_usage_duration_minutes: 45
  },
  {
    table_id: '3',
    table_number: 'T003',
    capacity: 6,
    status: 'reserved' as const,
    area: 'indoor',
    location_description: 'Back corner',
    reserved_customer_name: 'John Doe',
    reserved_customer_phone: '081234567890',
    reserved_from: '2024-01-10T19:00:00Z',
    reserved_until: '2024-01-10T21:00:00Z',
    reserved_guest_count: 6,
    position_x: 6,
    position_y: 2,
    total_usage_count: 35,
    total_revenue: 3150000,
    average_usage_duration_minutes: 90
  },
  {
    table_id: '4',
    table_number: 'T004',
    capacity: 4,
    status: 'cleaning' as const,
    area: 'indoor',
    location_description: 'Near bar',
    position_x: 8,
    position_y: 2,
    total_usage_count: 40,
    total_revenue: 2000000,
    last_cleaned_at: '2024-01-10T14:00:00Z',
    last_cleaned_by: 'Staff Maria',
    average_usage_duration_minutes: 60
  },

  // Outdoor Area  
  {
    table_id: '5',
    table_number: 'O001',
    capacity: 4,
    status: 'available' as const,
    area: 'outdoor',
    location_description: 'Garden terrace',
    position_x: 15,
    position_y: 2,
    total_usage_count: 25,
    total_revenue: 1750000,
    average_usage_duration_minutes: 80,
    last_cleaned_at: '2024-01-10T09:00:00Z'
  },
  {
    table_id: '6',
    table_number: 'O002',
    capacity: 2,
    status: 'occupied' as const,
    area: 'outdoor',
    location_description: 'Poolside',
    current_guest_count: 2,
    occupied_since: '2024-01-10T13:45:00Z',
    position_x: 17,
    position_y: 2,
    total_usage_count: 30,
    total_revenue: 1500000,
    average_usage_duration_minutes: 70
  },

  // VIP Area
  {
    table_id: '7',
    table_number: 'V001',
    capacity: 8,
    status: 'available' as const,
    area: 'vip',
    location_description: 'Private dining room',
    position_x: 2,
    position_y: 12,
    total_usage_count: 15,
    total_revenue: 2250000,
    average_usage_duration_minutes: 120,
    last_cleaned_at: '2024-01-10T11:00:00Z'
  },
  {
    table_id: '8',
    table_number: 'V002',
    capacity: 6,
    status: 'reserved' as const,
    area: 'vip',
    location_description: 'Executive suite',
    reserved_customer_name: 'Sarah Wilson',
    reserved_customer_phone: '081987654321',
    reserved_from: '2024-01-10T18:00:00Z',
    reserved_until: '2024-01-10T22:00:00Z',
    reserved_guest_count: 4,
    position_x: 4,
    position_y: 12,
    total_usage_count: 12,
    total_revenue: 2400000,
    average_usage_duration_minutes: 150
  },

  // Smoking Area
  {
    table_id: '9',
    table_number: 'S001',
    capacity: 4,
    status: 'available' as const,
    area: 'smoking',
    location_description: 'Smoking lounge',
    position_x: 15,
    position_y: 12,
    total_usage_count: 20,
    total_revenue: 800000,
    average_usage_duration_minutes: 40,
    last_cleaned_at: '2024-01-10T10:30:00Z'
  },
  {
    table_id: '10',
    table_number: 'S002',
    capacity: 2,
    status: 'out_of_order' as const,
    area: 'smoking',
    location_description: 'Corner booth',
    position_x: 17,
    position_y: 12,
    total_usage_count: 8,
    total_revenue: 320000,
    notes: 'Ventilation system needs repair',
    next_maintenance_date: '2024-01-12T00:00:00Z'
  },

  // Second Floor
  {
    table_id: '11',
    table_number: 'F201',
    capacity: 4,
    status: 'available' as const,
    area: 'second_floor',
    location_description: 'Overlooking main floor',
    position_x: 8,
    position_y: 12,
    total_usage_count: 18,
    total_revenue: 1080000,
    average_usage_duration_minutes: 65,
    last_cleaned_at: '2024-01-10T08:30:00Z'
  },
  {
    table_id: '12',
    table_number: 'F202',
    capacity: 6,
    status: 'cleaning' as const,
    area: 'second_floor',
    location_description: 'Balcony seating',
    position_x: 10,
    position_y: 12,
    total_usage_count: 22,
    total_revenue: 1760000,
    last_cleaned_at: '2024-01-10T15:00:00Z',
    last_cleaned_by: 'Staff Ahmed',
    average_usage_duration_minutes: 85
  }
];

export const mockTableStats = {
  total: 12,
  available: 5,
  occupied: 2,
  reserved: 2,
  cleaning: 2,
  out_of_order: 1,
  utilization_rate: '58.3',
  by_area: [
    { area: 'indoor', count: 4 },
    { area: 'outdoor', count: 2 },
    { area: 'vip', count: 2 },
    { area: 'smoking', count: 2 },
    { area: 'second_floor', count: 2 }
  ],
  by_capacity: [
    { capacity: 2, count: 3 },
    { capacity: 4, count: 5 },
    { capacity: 6, count: 3 },
    { capacity: 8, count: 1 }
  ]
};

export const mockUsageHistory = [
  {
    usage_id: '1',
    table_id: '1',
    order_id: 'ORD-001',
    customer_name: 'Alice Johnson',
    customer_phone: '081111111111',
    guest_count: 3,
    start_time: '2024-01-09T18:00:00Z',
    end_time: '2024-01-09T19:45:00Z',
    duration_minutes: 105,
    total_order_amount: 450000,
    total_payment_amount: 450000,
    usage_type: 'walk_in',
    waiter_assigned: 'John Staff',
    order_placed_at: '2024-01-09T18:10:00Z',
    food_served_at: '2024-01-09T18:35:00Z',
    payment_completed_at: '2024-01-09T19:40:00Z',
    created_at: '2024-01-09T18:00:00Z'
  },
  {
    usage_id: '2', 
    table_id: '1',
    order_id: 'ORD-002',
    customer_name: 'Bob Smith',
    customer_phone: '081222222222',
    guest_count: 2,
    start_time: '2024-01-09T12:30:00Z',
    end_time: '2024-01-09T13:20:00Z',
    duration_minutes: 50,
    total_order_amount: 180000,
    total_payment_amount: 180000,
    usage_type: 'reservation',
    waiter_assigned: 'Maria Staff',
    order_placed_at: '2024-01-09T12:35:00Z',
    food_served_at: '2024-01-09T12:55:00Z',
    payment_completed_at: '2024-01-09T13:15:00Z',
    created_at: '2024-01-09T12:30:00Z'
  },
  {
    usage_id: '3',
    table_id: '1',
    order_id: 'ORD-003',
    customer_name: 'Charlie Brown',
    customer_phone: '081333333333',
    guest_count: 4,
    start_time: '2024-01-08T19:15:00Z',
    end_time: '2024-01-08T20:30:00Z',
    duration_minutes: 75,
    total_order_amount: 620000,
    total_payment_amount: 620000,
    usage_type: 'walk_in',
    waiter_assigned: 'Ahmed Staff',
    order_placed_at: '2024-01-08T19:25:00Z',
    food_served_at: '2024-01-08T19:50:00Z',
    payment_completed_at: '2024-01-08T20:25:00Z',
    created_at: '2024-01-08T19:15:00Z'
  }
];

export const areaOptions = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'vip', label: 'VIP' },
  { value: 'smoking', label: 'Smoking Area' },
  { value: 'non_smoking', label: 'Non-Smoking Area' },
  { value: 'second_floor', label: 'Second Floor' },
  { value: 'terrace', label: 'Terrace' }
];

export const statusOptions = [
  { value: 'available', label: 'Available', color: 'success' },
  { value: 'occupied', label: 'Occupied', color: 'error' },
  { value: 'reserved', label: 'Reserved', color: 'warning' },
  { value: 'cleaning', label: 'Cleaning', color: 'info' },
  { value: 'out_of_order', label: 'Out of Order', color: 'default' }
];

// Helper functions
export const getStatusColor = (status: string) => {
  const statusMap = {
    available: 'success',
    occupied: 'error', 
    reserved: 'warning',
    cleaning: 'info',
    out_of_order: 'default'
  } as const;
  
  return statusMap[status as keyof typeof statusMap] || 'default';
};

export const getStatusIcon = (status: string) => {
  const iconMap = {
    available: '✅',
    occupied: '🔴', 
    reserved: '🟡',
    cleaning: '🧹',
    out_of_order: '⚠️'
  };
  
  return iconMap[status as keyof typeof iconMap] || '❓';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};
