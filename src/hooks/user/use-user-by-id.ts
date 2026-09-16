'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserByIdUseCase } from '@/infrastructure/di/user.container';

/** Detalle completo de un usuario (`GET /users/:id`) — el diálogo de edición
 * lo necesita para campos que el listado no trae a propósito (ver
 * `UserListItem`), como `userTypeId`. Mismo patrón que `useUserRole`. */
export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserByIdUseCase.execute(userId as string),
    enabled: userId !== null,
  });
}
