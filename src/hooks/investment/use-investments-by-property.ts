'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listInvestmentsByPropertyPaginatedUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deactivateInvestmentUseCase,
} from '@/infrastructure/di/investment.container';
import type { CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';
import type { ListInvestmentsByPropertyPaginatedParams } from '@/domain/investment/list-investments-by-property-paginated.use-case';

const INVESTMENTS_BY_PROPERTY_KEY = 'investments-by-property';

/** De una propiedad puntual, para cualquier gestión — "Propiedad" dispara
 * la consulta por sí sola (sin "Gestión" ni "Inversionista" elegidos),
 * paginado en el servidor. Mismo criterio que `useInvestmentsByGestion`/
 * `useInvestmentsByInvestor`. */
export function useInvestmentsByProperty(params: ListInvestmentsByPropertyPaginatedParams | null) {
  const queryClient = useQueryClient();
  const queryKey = [INVESTMENTS_BY_PROPERTY_KEY, params];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listInvestmentsByPropertyPaginatedUseCase.execute(params as ListInvestmentsByPropertyPaginatedParams),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [INVESTMENTS_BY_PROPERTY_KEY] });

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

  const pageSize = params?.pageSize ?? 1;
  return {
    investments: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    isLoading,
    createInvestment,
    updateInvestment: (id: string, data: UpdateInvestmentData) => updateInvestmentMutation({ id, data }),
    deactivateInvestment,
  };
}
