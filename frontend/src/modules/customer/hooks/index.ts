/**
 * Customer Hooks
 * 
 * Custom hooks untuk modul customer
 */

import { useState, useEffect } from 'react';

// Interface untuk customer
interface CustomerOrder {
  id: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  totalAmount: number;
  tableNumber: string;
  estimatedTime: number;
}

interface OrderItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialRequests?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  rating?: number;
}

interface CustomerTable {
  id: string;
  number: string;
  qrCode: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

// Hook untuk mengelola order customer
export const useCustomerOrder = () => {
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const addItemToOrder = (item: MenuItem, quantity: number = 1, specialRequests?: string) => {
    const orderItem: OrderItem = {
      id: `${item.id}_${Date.now()}`,
      menuId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      image: item.image,
      specialRequests
    };

    setCurrentOrder(prev => {
      if (!prev) {
        return {
          id: `order_${Date.now()}`,
          items: [orderItem],
          status: 'pending',
          totalAmount: item.price * quantity,
          tableNumber: '', // Will be set when table is selected
          estimatedTime: 20
        };
      }

      const existingItemIndex = prev.items.findIndex(i => i.menuId === item.id);
      let newItems;
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...prev.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item
        newItems = [...prev.items, orderItem];
      }

      return {
        ...prev,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder(prev => {
      if (!prev) return null;
      
      const newItems = prev.items.filter(item => item.id !== itemId);
      
      if (newItems.length === 0) {
        return null;
      }

      return {
        ...prev,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setCurrentOrder(prev => {
      if (!prev) return null;
      
      const newItems = prev.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );

      return {
        ...prev,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    });
  };

  const submitOrder = async (tableNumber: string) => {
    if (!currentOrder) return false;

    setLoading(true);
    try {
      const orderToSubmit = { ...currentOrder, tableNumber, status: 'confirmed' as const };
      
      // TODO: Submit to API
      setOrderHistory(prev => [...prev, orderToSubmit]);
      setCurrentOrder(null);
      return true;
    } catch (error) {
      console.error('Failed to submit order:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearOrder = () => {
    setCurrentOrder(null);
  };

  return {
    currentOrder,
    orderHistory,
    loading,
    addItemToOrder,
    removeItemFromOrder,
    updateItemQuantity,
    submitOrder,
    clearOrder
  };
};

// Hook untuk mengelola menu
export const useCustomerMenu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        // TODO: Fetch from API
        const mockMenu: MenuItem[] = [
          {
            id: '1',
            name: 'Nasi Goreng Special',
            description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
            price: 25000,
            category: 'Main Course',
            available: true,
            rating: 4.5
          },
          {
            id: '2',
            name: 'Es Teh Manis',
            description: 'Teh manis dingin yang menyegarkan',
            price: 5000,
            category: 'Beverages',
            available: true,
            rating: 4.0
          }
        ];
        
        setMenu(mockMenu);
        setCategories(['All', ...Array.from(new Set(mockMenu.map(item => item.category)))]);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredMenu = selectedCategory === 'All' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  return {
    menu: filteredMenu,
    allMenu: menu,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading
  };
};

// Hook untuk table management
export const useCustomerTable = () => {
  const [currentTable, setCurrentTable] = useState<CustomerTable | null>(null);
  const [availableTables, setAvailableTables] = useState<CustomerTable[]>([]);

  useEffect(() => {
    // TODO: Fetch available tables from API
    const mockTables: CustomerTable[] = [
      { id: '1', number: '1', qrCode: 'QR001', capacity: 4, status: 'available' },
      { id: '2', number: '2', qrCode: 'QR002', capacity: 2, status: 'available' },
      { id: '3', number: '3', qrCode: 'QR003', capacity: 6, status: 'occupied' }
    ];
    
    setAvailableTables(mockTables.filter(table => table.status === 'available'));
  }, []);

  const selectTable = (table: CustomerTable) => {
    setCurrentTable(table);
  };

  const leaveTable = () => {
    setCurrentTable(null);
  };

  return {
    currentTable,
    availableTables,
    selectTable,
    leaveTable
  };
};

// Hook untuk QR code scanning
export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const startScanning = () => {
    setIsScanning(true);
    // TODO: Implement camera access and QR scanning
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const processQRCode = (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    // TODO: Process QR code data (table number, etc.)
  };

  return {
    isScanning,
    scannedData,
    startScanning,
    stopScanning,
    processQRCode
  };
};
