import type { MenuItem } from '@/domain/menu/menu.entity';

/**
 * Un Super Administrador puede hacer todo, en cualquier menú, sin depender
 * de que existan filas de `role_menu_permissions` para su rol — así no queda
 * bloqueado si se agrega un menú nuevo y nadie le concede el permiso a mano
 * todavía. El resto de los roles usa los flags reales que manda el backend.
 *
 * Nota: esto es solo control de UI (ocultar/mostrar botones y pantallas),
 * no reemplaza autorización real en el backend — ver ARCHITECTURE.md.
 */
export function applySuperAdminOverride(items: MenuItem[], isSuperAdmin: boolean): MenuItem[] {
  if (!isSuperAdmin) return items;
  return items.map((item) => ({
    ...item,
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  }));
}
