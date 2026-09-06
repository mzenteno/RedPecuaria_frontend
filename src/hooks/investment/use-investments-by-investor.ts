'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listInvestmentsByInvestorUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deactivateInvestmentUseCase,
} from '@/infrastructure/di/investment.container';
import type { CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';
import type { ListInvestmentsByInvestorParams } from '@/domain/investment/list-investments-by-investor.use-case';

const INVESTMENTS_BY_INVESTOR_KEY = 'investments-by-investor';

/** De cualquier gestión y cualquier propiedad, para un inversionista puntual
 * (elegido en un combo, no la sesión — ver `useMyInvestments` para ese otro
 * caso) — paginado en el servidor. "Propiedad" es un filtro opcional
 * adicional, también resuelto en el servidor. */
export function useInvestmentsByInvestor(params: ListInvestmentsByInvestorParams | null) {
  const queryClient = useQueryClient();
  const queryKey = [INVESTMENTS_BY_INVESTOR_KEY, params];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listInvestmentsByInvestorUseCase.execute(params as ListInvestmentsByInvestorParams),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [INVESTMENTS_BY_INVESTOR_KEY] });

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
