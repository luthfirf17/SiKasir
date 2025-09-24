/**
 * Customer Services
 * 
 * API services untuk modul customer
 */

// Types untuk customer services
export interface CustomerMenu {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime: number;
  rating: number;
  reviewCount: number;
  allergens?: string[];
  spicyLevel?: 1 | 2 | 3 | 4 | 5;
}

export interface CustomerOrder {
  id: string;
  tableNumber: string;
  items: CustomerOrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  totalAmount: number;
  estimatedTime: number;
  specialInstructions?: string;
  createdAt: Date;
}

export interface CustomerOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialRequests?: string;
}

export interface CustomerTable {
  id: string;
  number: string;
  qrCode: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  location?: string;
}

export interface CustomerFeedback {
  orderId: string;
  rating: number;
  comment?: string;
  serviceRating: number;
  foodRating: number;
}

export const customerService = {
  // Menu management
  getMenu: async (): Promise<CustomerMenu[]> => {
    // TODO: Fetch menu from API
    return [];
  },

  getMenuByCategory: async (category: string): Promise<CustomerMenu[]> => {
    // TODO: Fetch menu items by category
    return [];
  },

  getMenuCategories: async (): Promise<string[]> => {
    // TODO: Fetch available categories
    return ['Appetizers', 'Main Course', 'Beverages', 'Desserts'];
  },

  searchMenu: async (query: string): Promise<CustomerMenu[]> => {
    // TODO: Search menu items
    return [];
  },

  // Order management
  submitOrder: async (orderData: {
    tableNumber: string;
    items: CustomerOrderItem[];
    specialInstructions?: string;
  }): Promise<CustomerOrder> => {
    // TODO: Submit order to API
    return {
      id: `order_${Date.now()}`,
      tableNumber: orderData.tableNumber,
      items: orderData.items,
      status: 'pending',
      totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      estimatedTime: 25,
      specialInstructions: orderData.specialInstructions,
      createdAt: new Date()
    };
  },

  getOrderStatus: async (orderId: string): Promise<CustomerOrder> => {
    // TODO: Get order status from API
    throw new Error('Order not found');
  },

  getOrderHistory: async (tableNumber: string): Promise<CustomerOrder[]> => {
    // TODO: Get order history for table
    return [];
  },

  // Table management
  getTableInfo: async (qrCode: string): Promise<CustomerTable> => {
    // TODO: Get table info from QR code
    return {
      id: '1',
      number: '1',
      qrCode,
      capacity: 4,
      status: 'available'
    };
  },

  occupyTable: async (tableId: string): Promise<boolean> => {
    // TODO: Mark table as occupied
    return true;
  },

  releaseTable: async (tableId: string): Promise<boolean> => {
    // TODO: Release table
    return true;
  },

  // Feedback
  submitFeedback: async (feedback: CustomerFeedback): Promise<boolean> => {
    // TODO: Submit customer feedback
    console.log('Feedback submitted:', feedback);
    return true;
  },

  // Notifications
  subscribeToOrderUpdates: (orderId: string, callback: (status: string) => void) => {
    // TODO: Subscribe to real-time order updates
    // This would typically use WebSocket or Server-Sent Events
  },

  // Payment request
  requestBill: async (tableNumber: string): Promise<boolean> => {
    // TODO: Request bill from waiter
    console.log(`Bill requested for table ${tableNumber}`);
    return true;
  },

  // Call waiter
  callWaiter: async (tableNumber: string, reason?: string): Promise<boolean> => {
    // TODO: Call waiter to table
    console.log(`Waiter called to table ${tableNumber}${reason ? ` - ${reason}` : ''}`);
    return true;
  }
};
