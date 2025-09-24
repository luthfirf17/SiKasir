/**
 * Kasir Hooks
 * 
 * Custom hooks untuk modul kasir
 */

import { useState, useEffect } from 'react';

// Interface untuk transaction data
interface Transaction {
  id: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'ewallet' | 'qris';
  timestamp: Date;
}

interface ShiftInfo {
  startTime: string;
  totalSales: number;
  transactionCount: number;
  cashInRegister: number;
}

// Hook untuk mengelola shift kasir
export const useKasirShift = () => {
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>({
    startTime: '08:00',
    totalSales: 0,
    transactionCount: 0,
    cashInRegister: 0
  });
  const [isShiftActive, setIsShiftActive] = useState(false);

  const startShift = () => {
    setIsShiftActive(true);
    setShiftInfo(prev => ({
      ...prev,
      startTime: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
  };

  const endShift = () => {
    setIsShiftActive(false);
    // TODO: Send shift data to server
  };

  return { shiftInfo, isShiftActive, startShift, endShift };
};

// Hook untuk mengelola transaksi
export const useKasirTransaction = () => {
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const startTransaction = () => {
    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      amount: 0,
      paymentMethod: 'cash',
      timestamp: new Date()
    };
    setCurrentTransaction(newTransaction);
  };

  const completeTransaction = async (transaction: Transaction) => {
    setLoading(true);
    try {
      // TODO: Process transaction with API
      setTransactions(prev => [...prev, transaction]);
      setCurrentTransaction(null);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    currentTransaction, 
    transactions, 
    loading, 
    startTransaction, 
    completeTransaction 
  };
};

// Hook untuk navigation kasir
export const useKasirNavigation = () => {
  const [currentPath, setCurrentPath] = useState('/kasir/dashboard');

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    // TODO: Implement actual navigation
  };

  return { currentPath, navigateTo };
};
