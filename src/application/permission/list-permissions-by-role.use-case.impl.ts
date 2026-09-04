import type { ListPermissionsByRoleUseCase } from '@/domain/permission/list-permissions-by-role.use-case';
import type { PermissionRepository } from '@/domain/permission/permission.repository';
import type { RoleMenuPermission } from '@/domain/permission/permission.entity';

export class ListPermissionsByRoleUseCaseImpl implements ListPermissionsByRoleUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(roleId: string): Promise<RoleMenuPermission[]> {
    return this.permissionRepository.listByRole(roleId);
  }
}
