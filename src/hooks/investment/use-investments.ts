'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listInvestmentsByPropertyUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deactivateInvestmentUseCase,
} from '@/infrastructure/di/investment.container';
import type { CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';

function investmentsKey(propertyId: string) {
  return ['investments', propertyId];
}

/** Las inversiones son siempre de una propiedad puntual — sin `propertyId`
 * la query queda deshabilitada (todavía no se eligió una propiedad en el
 * combo de la pantalla). */
export function useInvestments(propertyId: string | null) {
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading } = useQuery({
    queryKey: propertyId ? investmentsKey(propertyId) : ['investments', 'none'],
    queryFn: () => listInvestmentsByPropertyUseCase.execute(propertyId as string),
    enabled: propertyId !== null,
  });

  const invalidate = () => {
    if (propertyId) {
      queryClient.invalidateQueries({ queryKey: investmentsKey(propertyId) });
    }
  };

  const { mutateAsync: createInvestment } = useMutation({
    mutationFn: (data: CreateInvestmentData) => createInvestmentUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateInvestmentMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvestmentData }) =>
      updateInvestmentUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateInvestment } = useMutation({
    mutationFn: (id: string) => deactivateInvestmentUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    investments,
    isLoading,
    createInvestment,
    updateInvestment: (id: string, data: UpdateInvestmentData) => updateInvestmentMutation({ id, data }),
    deactivateInvestment,
  };
}
