'use client';

import { useQuery } from '@tanstack/react-query';
import { getMenuItemsUseCase } from '@/infrastructure/di/menu.container';
import { useIsSuperAdmin } from './use-is-super-admin';

export interface MenuPermission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** `true` mientras todavía no se sabe el permiso real — usarlo para no
   * ocultar/redirigir de más antes de tiempo (ver `RequirePermission`). */
  isLoading: boolean;
}

const NO_PERMISSION = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

/**
 * Permisos del rol actual sobre un menú puntual (por `key`), para ocultar
 * acciones en pantalla (crear/editar/eliminar) según `role_menu_permissions`
 * — con el override de Super Administrador ya resuelto (ver
 * `apply-super-admin-override.ts`).
 *
 * Importante: esto es solo control de UI. El backend no valida estos
 * permisos todavía (decisión explícita, ver ARCHITECTURE.md) — alguien con
 * un token válido puede seguir llamando la API directamente sin pasar por
 * acá. No usar esto como si fuera una barrera de seguridad real.
 */
export function usePermission(menuKey: string): MenuPermission {
  const isSuperAdmin = useIsSuperAdmin();
  const { data, isLoading } = useQuery({
    queryKey: ['authorized-menu-items', isSuperAdmin],
    queryFn: () => getMenuItemsUseCase.execute(isSuperAdmin),
    staleTime: 60_000,
  });

  const item = data?.find((menuItem) => menuItem.key === menuKey);
  const permission = item
    ? { canView: item.canView, canCreate: item.canCreate, canEdit: item.canEdit, canDelete: item.canDelete }
    : NO_PERMISSION;

  return { ...permission, isLoading };
}
