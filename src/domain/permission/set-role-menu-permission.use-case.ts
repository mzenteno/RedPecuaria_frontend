import type { RoleMenuPermission, SetPermissionData } from './permission.entity';

export interface SetRoleMenuPermissionUseCase {
  execute(roleId: string, menuId: string, data: SetPermissionData): Promise<RoleMenuPermission>;
}
