import type { Role, CreateRoleData } from './role.entity';

export interface CreateRoleUseCase {
  execute(data: CreateRoleData): Promise<Role>;
}
