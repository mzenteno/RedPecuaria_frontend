'use client';

import { useQuery } from '@tanstack/react-query';
import { investmentTypeRepository } from '@/features/investments/investment.container';

export function useInvestmentTypes() {
  return useQuery({
    queryKey: ['investment-types'],
    queryFn: () => investmentTypeRepository.list(),
    staleTime: 60_000,
  });
}
