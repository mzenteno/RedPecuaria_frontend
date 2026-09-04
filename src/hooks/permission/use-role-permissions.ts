'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMenuCatalog } from '@/hooks/menu/use-menu-catalog';
import {
  listPermissionsByRoleUseCase,
  setRoleMenuPermissionUseCase,
} from '@/infrastructure/di/permission.container';
import type { RoleMenuPermission, SetPermissionData } from '@/domain/permission/permission.entity';

export interface MenuPermissionRow {
  menuId: string;
  menuKey: string;
  menuLabel: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

function permissionsKey(roleId: string) {
  return ['role-permissions', roleId];
}

/**
 * Junta el catálogo completo de menús (`useMenuCatalog`, "qué existe") con
 * los permisos ya configurados de un rol puntual (`GET
 * /roles/:roleId/permissions`, "qué tiene configurado") — un menú sin fila
 * propia todavía se muestra con los 4 flags en `false`, no se omite (así se
 * puede activar directamente desde la grilla).
 *
 * Solo menús "reales" (`path !== null`): un padre puramente organizativo
 * (ej. "Administración") no tiene ningún caso de uso de negocio detrás de
 * sus permisos — nadie los lee.
 *
 * `setPermission` actualiza el cache de forma optimista (la casilla
 * responde al toque, no espera el round-trip) y revierte sola si el PUT
 * falla.
 */
export function useRolePermissions(roleId: string | null) {
  const queryClient = useQueryClient();
  const { data: menus = [], isLoading: menusLoading } = useMenuCatalog();

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: roleId ? permissionsKey(roleId) : ['role-permissions', 'none'],
    queryFn: () => listPermissionsByRoleUseCase.execute(roleId as string),
    enabled: roleId !== null,
  });

  const rows: MenuPermissionRow[] = menus
    .filter((menu) => menu.path !== null)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((menu) => {
      const permission = permissions.find((p) => p.menuId === menu.id);
      return {
        menuId: menu.id,
        menuKey: menu.key,
        menuLabel: menu.label,
        canView: permission?.canView ?? false,
        canCreate: permission?.canCreate ?? false,
        canEdit: permission?.canEdit ?? false,
        canDelete: permission?.canDelete ?? false,
      };
    });

  const { mutateAsync: setPermissionMutation, isPending: saving } = useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: SetPermissionData }) =>
      setRoleMenuPermissionUseCase.execute(roleId as string, menuId, data),
    onMutate: async ({ menuId, data }) => {
      if (!roleId) return undefined;
      const key = permissionsKey(roleId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RoleMenuPermission[]>(key);
      queryClient.setQueryData<RoleMenuPermission[]>(key, (old = []) => {
        const exists = old.some((p) => p.menuId === menuId);
        if (exists) {
          return old.map((p) => (p.menuId === menuId ? { ...p, ...data } : p));
        }
        return [...old, { id: `optimistic-${menuId}`, roleId, menuId, isDeleted: false, ...data }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (roleId && context?.previous) {
        queryClient.setQueryData(permissionsKey(roleId), context.previous);
      }
    },
    onSettled: () => {
      if (roleId) {
        queryClient.invalidateQueries({ queryKey: permissionsKey(roleId) });
      }
    },
  });

  return {
    rows,
    isLoading: menusLoading || permissionsLoading,
    saving,
    setPermission: (menuId: string, data: SetPermissionData) => setPermissionMutation({ menuId, data }),
  };
}
