'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { investmentRepository } from '@/features/investments/investment.container';

const MY_INVESTMENTS_KEY = 'investments-mine';

/** Inversiones del usuario logueado como inversionista — para la lista de
 * "Mis inversiones" de la pantalla de Kardex. Paginado en el servidor (ver
 * ARCHITECTURE.md §8/§9: todo listado pagina en el servidor salvo
 * Empresas/Roles/Permisos).
 *
 * `enabled` (default `true`): en `kardex/page.tsx`, esa tabla de "Mis
 * inversiones" solo se muestra cuando todavía no se eligió ninguna
 * inversión — si se entró por el atajo "Ver kardex" (con `investmentId` ya
 * sabido), pedirla es un fetch desperdiciado (bug real, ver el change de
 * este cambio). */
export function useMyInvestments(page: number, pageSize: number, enabled = true) {
  const { data, isLoading } = useQuery({
    queryKey: [MY_INVESTMENTS_KEY, page, pageSize],
    queryFn: () => investmentRepository.listMine({ page, pageSize }),
    placeholderData: keepPreviousData,
    enabled,
  });

  return {
    investments: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    isLoading,
  };
}
