'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listKardexEntriesByInvestmentUseCase,
  createKardexEntryUseCase,
  updateKardexEntryUseCase,
  deactivateKardexEntryUseCase,
} from '@/infrastructure/di/kardex.container';
import type { CreateKardexEntryData, UpdateKardexEntryData } from '@/domain/kardex/kardex-entry.entity';

function kardexKey(investmentId: string) {
  return ['kardex-entries', investmentId];
}

/** El kardex es siempre de una inversión puntual — sin `investmentId`
 * (todavía no se eligió Propiedad + Inversión en los combobox de la
 * pantalla) la query queda deshabilitada, igual criterio que
 * `useInvestments`. Paginado en el servidor (ver ARCHITECTURE.md §8/§9). */
export function useKardexEntries(investmentId: string | null, page: number, pageSize: number, search: string) {
  const queryClient = useQueryClient();
  const queryKey = [...kardexKey(investmentId ?? 'none'), page, pageSize, search];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listKardexEntriesByInvestmentUseCase.execute({
        investmentId: investmentId as string,
        page,
        pageSize,
        search: search || undefined,
      }),
    enabled: investmentId !== null,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    if (investmentId) {
      queryClient.invalidateQueries({ queryKey: kardexKey(investmentId) });
    }
  };

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
    isLoading,
    createEntry,
    updateEntry: (id: string, data: UpdateKardexEntryData) => updateEntryMutation({ id, data }),
    deactivateEntry,
  };
}
