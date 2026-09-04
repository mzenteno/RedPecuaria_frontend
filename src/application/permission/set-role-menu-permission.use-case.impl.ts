import type { SetRoleMenuPermissionUseCase } from '@/domain/permission/set-role-menu-permission.use-case';
import type { PermissionRepository } from '@/domain/permission/permission.repository';
import type { RoleMenuPermission, SetPermissionData } from '@/domain/permission/permission.entity';

export class SetRoleMenuPermissionUseCaseImpl implements SetRoleMenuPermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(roleId: string, menuId: string, data: SetPermissionData): Promise<RoleMenuPermission> {
    return this.permissionRepository.set(roleId, menuId, data);
  }
}
