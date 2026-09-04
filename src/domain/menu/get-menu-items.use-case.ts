import type { MenuItem } from './menu.entity';

export interface GetMenuItemsUseCase {
  /**
   * Catálogo completo, plano (sin armar árbol), con los permisos ya
   * resueltos: si `isSuperAdmin` es `true`, los 4 flags de cada ítem vienen
   * forzados a `true` sin importar lo que diga `role_menu_permissions` — es
   * la única excepción al modelo de permisos por rol (ver
   * `apply-super-admin-override.ts`).
   */
  execute(isSuperAdmin: boolean): Promise<MenuItem[]>;
}
