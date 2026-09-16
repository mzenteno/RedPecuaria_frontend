'use client';

import { useQuery } from '@tanstack/react-query';
import { getKardexEntryByIdUseCase } from '@/infrastructure/di/kardex.container';

/** Detalle completo de un movimiento (`GET /kardex-entries/:id`) — el
 * diálogo de edición lo necesita para campos que el listado no trae a
 * propósito (ver `KardexEntryListItem`), como `total`. Mismo patrón que
 * `useInvestmentById`/`useUserById`. */
export function useKardexEntryById(entryId: string | null) {
  return useQuery({
    queryKey: ['kardex-entry', entryId],
    queryFn: () => getKardexEntryByIdUseCase.execute(entryId as string),
    enabled: entryId !== null,
  });
}
