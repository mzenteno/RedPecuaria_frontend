import type { Role, UpdateRoleData } from './role.entity';

export interface UpdateRoleUseCase {
  execute(id: string, data: UpdateRoleData): Promise<Role>;
}
