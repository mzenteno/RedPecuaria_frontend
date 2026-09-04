'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserRoleUseCase } from '@/infrastructure/di/user-company.container';

/** El vínculo (id + roleId) de un usuario en la empresa activa — lo necesita
 * el diálogo de edición para saber qué rol tiene hoy y qué `userCompanyId`
 * mandarle a `changeUserRoleUseCase`. */
export function useUserRole(userId: string | null) {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: () => getUserRoleUseCase.execute(userId as string),
    enabled: userId !== null,
  });
}
