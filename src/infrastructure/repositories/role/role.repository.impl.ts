import type { RoleRepository } from '@/domain/role/role.repository';
import type { Role, CreateRoleData, UpdateRoleData } from '@/domain/role/role.entity';
import { httpClient } from '../../http/http-client';

export class RoleRepositoryImpl implements RoleRepository {
  async list(): Promise<Role[]> {
    return httpClient.get<Role[]>('/roles');
  }

  async create(data: CreateRoleData): Promise<Role> {
    return httpClient.post<Role>('/roles', data);
  }

  async update(id: string, data: UpdateRoleData): Promise<Role> {
    return httpClient.patch<Role>(`/roles/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/roles/${id}/deactivate`);
  }
}
