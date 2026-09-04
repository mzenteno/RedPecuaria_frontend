import type { PermissionRepository } from '@/domain/permission/permission.repository';
import type { RoleMenuPermission, SetPermissionData } from '@/domain/permission/permission.entity';
import { httpClient } from '../../http/http-client';

export class PermissionRepositoryImpl implements PermissionRepository {
  async listByRole(roleId: string): Promise<RoleMenuPermission[]> {
    return httpClient.get<RoleMenuPermission[]>(`/roles/${roleId}/permissions`);
  }

  async set(roleId: string, menuId: string, data: SetPermissionData): Promise<RoleMenuPermission> {
    return httpClient.put<RoleMenuPermission>(`/roles/${roleId}/menus/${menuId}/permissions`, data);
  }
}
