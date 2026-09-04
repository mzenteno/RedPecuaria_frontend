'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRolesUseCase,
  createRoleUseCase,
  updateRoleUseCase,
  deactivateRoleUseCase,
} from '@/infrastructure/di/role.container';
import type { CreateRoleData, UpdateRoleData } from '@/domain/role/role.entity';

const ROLES_KEY = ['roles'];

/**
 * Sin paginación de servidor, igual criterio que `useCompanies` — un rol
 * pertenece a una sola empresa (la activa de la sesión), se espera un
 * puñado, no miles.
 */
export function useRoles() {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => listRolesUseCase.execute(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ROLES_KEY });

  const { mutateAsync: createRole } = useMutation({
    mutationFn: (data: CreateRoleData) => createRoleUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateRoleMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) => updateRoleUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateRole } = useMutation({
    mutationFn: (id: string) => deactivateRoleUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    roles,
    isLoading,
    createRole,
    updateRole: (id: string, data: UpdateRoleData) => updateRoleMutation({ id, data }),
    deactivateRole,
  };
}
