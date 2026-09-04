import type { RoleMenuPermission } from './permission.entity';

export interface ListPermissionsByRoleUseCase {
  execute(roleId: string): Promise<RoleMenuPermission[]>;
}
