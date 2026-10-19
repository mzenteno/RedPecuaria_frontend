'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listKardexEntriesByInvestmentUseCase,
  createKardexEntryUseCase,
  updateKardexEntryUseCase,
  deactivateKardexEntryUseCase,
  setKardexInvestorFinishedUseCase,
} from '@/infrastructure/di/kardex.container';
import type { CreateKardexEntryData, UpdateKardexEntryData } from '@/domain/kardex/kardex-entry.entity';

function kardexKey(investmentId: string, investorUserId: string) {
  return ['kardex-entries', investmentId, investorUserId];
}

/** El kardex es siempre de una inversión Y un inversionista puntuales (a
 * pedido del usuario, 2026-10-14) — sin ambos (todavía no se eligió
 * Propiedad + Inversión, o no se eligió inversionista en la pantalla
 * intermedia) la query queda deshabilitada. Paginado en el servidor (ver
 * ARCHITECTURE.md §8/§9). */
export function useKardexEntries(
  investmentId: string | null,
  investorUserId: string | null,
  page: number,
  pageSize: number,
  search: string,
) {
  const queryClient = useQueryClient();
  const queryKey = [...kardexKey(investmentId ?? 'none', investorUserId ?? 'none'), page, pageSize, search];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listKardexEntriesByInvestmentUseCase.execute({
        investmentId: investmentId as string,
        investorUserId: investorUserId as string,
        page,
        pageSize,
        search: search || undefined,
      }),
    enabled: investmentId !== null && investorUserId !== null,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    if (investmentId && investorUserId) {
      queryClient.invalidateQueries({ queryKey: kardexKey(investmentId, investorUserId) });
    }
  };

  const { mutateAsync: setInvestorFinishedMutation } = useMutation({
    mutationFn: (isFinished: boolean) =>
      setKardexInvestorFinishedUseCase.execute({
        investmentId: investmentId as string,
        investorUserId: investorUserId as string,
        isFinished,
      }),
    onSuccess: () => {
      invalidate();
      // Cambia también las pestañas de "Mis inversiones" y el estado
      // derivado de la inversión (columna "Estado" en Inversiones) — todos
      // los listados de inversiones usan claves `investments-*`, más el
      // detalle `['investment', id]`.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && (key === 'investment' || key.startsWith('investments-'));
        },
      });
    },
  });

  const { mutateAsync: createEntry } = useMutation({
    mutationFn: (data: CreateKardexEntryData) => createKardexEntryUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateEntryMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKardexEntryData }) =>
      updateKardexEntryUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateEntry } = useMutation({
    mutationFn: (id: string) => deactivateKardexEntryUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    entries: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    // Debe/Haber de TODO el historial activo (no solo la página) — para el
    // footer de la tabla, ver `KardexTable`.
    totalDebe: data?.totalDebe ?? 0,
    totalHaber: data?.totalHaber ?? 0,
    // Saldo VIGENTE del inversionista — "Saldo actual" en `page.tsx`, ya no
    // sale de `Investment.balance*` (agregado de todos los inversionistas).
    investorBalanceQuantity: data?.investorBalanceQuantity ?? 0,
    investorBalanceKilos: data?.investorBalanceKilos ?? 0,
    investorTotal: data?.investorTotal ?? 0,
    investorIsFinished: data?.investorIsFinished ?? false,
    isLoading,
    createEntry,
    updateEntry: (id: string, data: UpdateKardexEntryData) => updateEntryMutation({ id, data }),
    deactivateEntry,
    setInvestorFinished: setInvestorFinishedMutation,
  };
}
