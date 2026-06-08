import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/api/dashboard.service';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardStats();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardStats,
  };
};
