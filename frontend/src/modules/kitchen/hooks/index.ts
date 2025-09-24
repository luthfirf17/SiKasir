/**
 * Kitchen Hooks
 * 
 * Custom hooks untuk modul kitchen/waiter
 */

import { useState, useEffect } from 'react';

// Interface untuk order queue
interface KitchenOrder {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'preparing' | 'ready' | 'served';
  estimatedTime: number;
  createdAt: Date;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

// Hook untuk mengelola order queue
export const useKitchenQueue = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status']) => {
    setLoading(true);
    try {
      // TODO: Update via API
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setLoading(false);
    }
  };

  const markOrderReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const markOrderServed = (orderId: string) => {
    updateOrderStatus(orderId, 'served');
  };

  return { orders, loading, updateOrderStatus, markOrderReady, markOrderServed };
};

// Hook untuk mengelola inventory
export const useKitchenInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // TODO: Fetch from API
        const mockInventory: InventoryItem[] = [
          { id: '1', name: 'Beef', currentStock: 5, minStock: 10, unit: 'kg' },
          { id: '2', name: 'Chicken', currentStock: 15, minStock: 20, unit: 'kg' },
          { id: '3', name: 'Rice', currentStock: 50, minStock: 30, unit: 'kg' }
        ];
        setInventory(mockInventory);
        setLowStockItems(mockInventory.filter(item => item.currentStock <= item.minStock));
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return { inventory, lowStockItems, loading };
};

// Hook untuk timer preparation
export const usePreparationTimer = () => {
  const [timers, setTimers] = useState<Record<string, number>>({});

  const startTimer = (orderId: string, duration: number) => {
    setTimers(prev => ({ ...prev, [orderId]: duration }));
    
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTime = prev[orderId] - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          const { [orderId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [orderId]: newTime };
      });
    }, 1000);
  };

  const stopTimer = (orderId: string) => {
    setTimers(prev => {
      const { [orderId]: removed, ...rest } = prev;
      return rest;
    });
  };

  return { timers, startTimer, stopTimer };
};

// Hook untuk kitchen navigation
export const useKitchenNavigation = () => {
  const [currentPath, setCurrentPath] = useState('/kitchen/dashboard');

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    // TODO: Implement actual navigation
  };

  return { currentPath, navigateTo };
};
