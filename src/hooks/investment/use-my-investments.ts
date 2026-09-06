'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listMyInvestmentsUseCase } from '@/infrastructure/di/investment.container';

const MY_INVESTMENTS_KEY = 'investments-mine';

/** Inversiones del usuario logueado como inversionista — para la lista de
 * "Mis inversiones" de la pantalla de Kardex. Paginado en el servidor (ver
 * ARCHITECTURE.md §8/§9: todo listado pagina en el servidor salvo
 * Empresas/Roles/Permisos). */
export function useMyInvestments(page: number, pageSize: number) {
  const { data, isLoading } = useQuery({
    queryKey: [MY_INVESTMENTS_KEY, page, pageSize],
    queryFn: () => listMyInvestmentsUseCase.execute({ page, pageSize }),
    placeholderData: keepPreviousData,
  });

  return {
    investments: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    isLoading,
  };
}
