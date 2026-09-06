'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardUseCase } from '@/infrastructure/di/dashboard.container';

export function useAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin-summary'],
    queryFn: () => getAdminDashboardUseCase.execute(),
  });

  return {
    propertiesCount: data?.propertiesCount ?? 0,
    activeInvestmentsCount: data?.activeInvestmentsCount ?? 0,
    investorsCount: data?.investorsCount ?? 0,
    totalSalesAmount: data?.totalSalesAmount ?? 0,
    topInvestors: data?.topInvestors ?? [],
    recentMovements: data?.recentMovements ?? [],
    isLoading,
  };
}
