'use client';

import { useQuery } from '@tanstack/react-query';
import { getInvestmentByIdUseCase } from '@/infrastructure/di/investment.container';

/** Detalle completo de una inversión (`GET /investments/:id`) — para campos
 * que los listados no traen a propósito (ver `InvestmentListItem`), como el
 * saldo (`balanceQuantity`/`balanceKilos`/`total`). Usado por `InvestmentDialog`
 * (edición) y Kardex ("Saldo actual"). Mismo patrón que `useUserById`. */
export function useInvestmentById(investmentId: string | null) {
  return useQuery({
    queryKey: ['investment', investmentId],
    queryFn: () => getInvestmentByIdUseCase.execute(investmentId as string),
    enabled: investmentId !== null,
  });
}
