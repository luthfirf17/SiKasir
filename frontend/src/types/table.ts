export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  location: TableLocation;
  qrCode?: string;
  currentOrder?: string;
  reservations: Reservation[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  OUT_OF_ORDER = 'out_of_order'
}

export enum TableLocation {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  VIP = 'vip',
  BAR = 'bar',
  PRIVATE_ROOM = 'private_room'
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  duration: number; // in minutes
  status: ReservationStatus;
  specialRequests?: string;
  tableId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface TableFormData {
  number: string;
  capacity: number;
  location: TableLocation;
  isActive: boolean;
}
