'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserTypes } from '@/hooks/user-type/use-user-types';
import { listUsersUseCase } from '@/infrastructure/di/user.container';

const INVESTOR_TYPE_NAME = 'Inversionista';
// Sin paginación real acá a propósito (fase 1): trae hasta 100 usuarios de
// la empresa activa y filtra por tipo del lado del cliente — si una empresa
// llega a tener más inversionistas que eso, hay que pasar esto a un filtro
// real de servidor (`GET /users?userTypeId=`), no está hecho todavía.
const PAGE_SIZE = 100;

/** Usuarios de tipo Inversionista de la empresa activa — para el
 * multi-select de `InvestmentDialog` (solo ellos pueden ser inversionistas
 * de una `Investment`, ver docs/investment/investment.md del backend). */
export function useInvestorUsers() {
  const { data: userTypes } = useUserTypes();
  const investorTypeId = userTypes?.find((type) => type.name === INVESTOR_TYPE_NAME)?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['investor-users', investorTypeId],
    queryFn: () => listUsersUseCase.execute({ page: 1, pageSize: PAGE_SIZE }),
    enabled: investorTypeId !== null,
  });

  const investors = (data?.items ?? []).filter((user) => user.userTypeId === investorTypeId);

  return { investors, isLoading };
}
