/**
 * Admin Hooks
 * 
 * Custom hooks untuk modul admin
 */

import { useState, useEffect } from 'react';
import { adminService, type AdminStats } from '../services';

// Hook untuk mendapatkan statistik admin
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

// Hook untuk navigation state
export const useAdminNavigation = () => {
  const [currentPath, setCurrentPath] = useState('/admin/dashboard');

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    // TODO: Implement actual navigation
  };

  return { currentPath, navigateTo };
};

// Default export to ensure module is recognized
const adminHooks = { useAdminStats, useAdminNavigation };
export default adminHooks;
