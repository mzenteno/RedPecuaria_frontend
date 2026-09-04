'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listUsersUseCase,
  createUserUseCase,
  updateUserUseCase,
  deactivateUserUseCase,
} from '@/infrastructure/di/user.container';
import type { CreateUserData, UpdateUserData } from '@/domain/user/user.entity';

const USERS_KEY = 'users';

/**
 * A diferencia de `useCompanies` (paginación de cliente), acá `page` y
 * `search` viajan al servidor en cada request (`GET /users?page=&search=`)
 * — la tabla de usuarios puede crecer mucho más que la de empresas (ver
 * docs/user/user.md). `keepPreviousData` evita el parpadeo de "Cargando..."
 * al cambiar de página: mantiene la página anterior en pantalla hasta que
 * llega la nueva.
 */
export function useUsers(page: number, pageSize: number, search: string) {
  const queryClient = useQueryClient();
  const queryKey = [USERS_KEY, page, pageSize, search];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listUsersUseCase.execute({ page, pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [USERS_KEY] });

  const { mutateAsync: createUser } = useMutation({
    mutationFn: (data: CreateUserData) => createUserUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateUserMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => updateUserUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateUser } = useMutation({
    mutationFn: (id: string) => deactivateUserUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    // Con `keepPreviousData`, `isLoading` (React Query v5) solo es `true` en
    // la carga inicial sin datos todavía — cambiar de página/búsqueda no
    // "parpadea" a vacío, sigue mostrando la página anterior hasta la nueva.
    isLoading,
    createUser,
    updateUser: (id: string, data: UpdateUserData) => updateUserMutation({ id, data }),
    deactivateUser,
  };
}
