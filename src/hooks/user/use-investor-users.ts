'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserTypes } from '@/hooks/user-type/use-user-types';
import { listUserOptionsUseCase } from '@/infrastructure/di/user.container';

const INVESTOR_TYPE_NAME = 'Inversionista';

/** Usuarios de tipo Inversionista de la empresa activa (`id`+`fullName`,
 * sin paginar) — para el multi-select de `InvestmentDialog` (solo ellos
 * pueden ser inversionistas de una `Investment`, ver
 * docs/investment/investment.md del backend).
 *
 * `GET /users/options?userTypeId=` — endpoint propio, liviano y filtrado en
 * el servidor: antes esto pedía `GET /users` con `pageSize=100` y filtraba
 * por `userTypeName` del lado del cliente, lo que se rompía silenciosamente
 * si una empresa pasaba de 100 usuarios (ver `docs/user/changes/...`).
 * `useUserTypes()` solo resuelve el `id` de "Inversionista" para armar ese
 * filtro — el catálogo completo de tipos, no la lista de usuarios. */
export function useInvestorUsers() {
  const { data: userTypes } = useUserTypes();
  const investorTypeId = userTypes?.find((type) => type.name === INVESTOR_TYPE_NAME)?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['investor-users', investorTypeId],
    queryFn: () => listUserOptionsUseCase.execute({ userTypeId: investorTypeId as string }),
    enabled: investorTypeId !== null,
  });

  return { investors: data ?? [], isLoading };
}
