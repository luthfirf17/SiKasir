export interface SystemConfig {
  id: string;
  restaurantName: string;
  restaurantLogo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  timezone: string;
  currency: string;
  language: string;
  operatingHours: OperatingHours;
  taxSettings: TaxSettings;
  paymentMethods: PaymentMethod[];
  notifications: NotificationSettings;
  features: FeatureSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakTime?: {
    start: string;
    end: string;
  };
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxName: string;
  isInclusive: boolean;
  customTaxRates: CustomTaxRate[];
}

export interface CustomTaxRate {
  id: string;
  name: string;
  rate: number;
  applicableTo: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  isEnabled: boolean;
  config?: Record<string, any>;
}

export enum PaymentType {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  QR_CODE = 'qr_code'
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    recipients: string[];
  };
  sms: {
    enabled: boolean;
    recipients: string[];
  };
  push: {
    enabled: boolean;
  };
  slack: {
    enabled: boolean;
    webhookUrl?: string;
  };
}

export interface FeatureSettings {
  multiLanguage: boolean;
  reservationSystem: boolean;
  loyaltyProgram: boolean;
  inventoryManagement: boolean;
  kitchenDisplay: boolean;
  onlineOrdering: boolean;
  deliveryIntegration: boolean;
  analytics: boolean;
}
