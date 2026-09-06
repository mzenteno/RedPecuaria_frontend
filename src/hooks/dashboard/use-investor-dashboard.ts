'use client';

import { useQuery } from '@tanstack/react-query';
import { getInvestorDashboardUseCase } from '@/infrastructure/di/dashboard.container';

export function useInvestorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'investor-summary'],
    queryFn: () => getInvestorDashboardUseCase.execute(),
  });

  return {
    investmentsCount: data?.investmentsCount ?? 0,
    totalSalesReceived: data?.totalSalesReceived ?? 0,
    investments: data?.investments ?? [],
    isLoading,
  };
}
