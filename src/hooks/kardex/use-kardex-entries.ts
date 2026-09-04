'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

/** El kardex es siempre de una inversión puntual — sin `investmentId` (todavía
 * no se eligió Propiedad + Inversión en los combobox de la pantalla) la
 * query queda deshabilitada, igual criterio que `useInvestments`. */
export function useKardexEntries(investmentId: string | null) {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: investmentId ? kardexKey(investmentId) : ['kardex-entries', 'none'],
    queryFn: () => listKardexEntriesByInvestmentUseCase.execute(investmentId as string),
    enabled: investmentId !== null,
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
    entries,
    isLoading,
    createEntry,
    updateEntry: (id: string, data: UpdateKardexEntryData) => updateEntryMutation({ id, data }),
    deactivateEntry,
  };
}
