'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listInvestmentsByGestionUseCase,
  createInvestmentUseCase,
  updateInvestmentUseCase,
  deactivateInvestmentUseCase,
} from '@/infrastructure/di/investment.container';
import type { CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';
import type { ListInvestmentsByGestionParams } from '@/domain/investment/list-investments-by-gestion.use-case';

const INVESTMENTS_BY_GESTION_KEY = 'investments-by-gestion';

/** De cualquier propiedad de la empresa activa, para una gestión puntual —
 * "Gestión" dispara la consulta, paginado en el servidor.
 * "Propiedad"/"Inversionista" son filtros opcionales adicionales, también
 * resueltos en el servidor (con paginación real, filtrar solo la página ya
 * traída del lado del cliente daría un resultado incompleto). */
export function useInvestmentsByGestion(params: ListInvestmentsByGestionParams | null) {
  const queryClient = useQueryClient();
  const queryKey = [INVESTMENTS_BY_GESTION_KEY, params];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listInvestmentsByGestionUseCase.execute(params as ListInvestmentsByGestionParams),
    enabled: params !== null,
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [INVESTMENTS_BY_GESTION_KEY] });

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
