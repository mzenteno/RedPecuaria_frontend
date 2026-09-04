import type { RoleMenuPermission, SetPermissionData } from './permission.entity';

export interface PermissionRepository {
  /** `GET /roles/:roleId/permissions` — solo las filas ya configuradas, no
   * el catálogo completo (eso sale de `MenuRepository.listCatalog`). */
  listByRole(roleId: string): Promise<RoleMenuPermission[]>;
  /** `PUT /roles/:roleId/menus/:menuId/permissions` — upsert, manda los 4
   * flags siempre juntos (no hay "actualizar solo uno"). */
  set(roleId: string, menuId: string, data: SetPermissionData): Promise<RoleMenuPermission>;
}
