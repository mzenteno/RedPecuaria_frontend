import type { UpdateRoleUseCase } from '@/domain/role/update-role.use-case';
import type { RoleRepository } from '@/domain/role/role.repository';
import type { Role, UpdateRoleData } from '@/domain/role/role.entity';

export class UpdateRoleUseCaseImpl implements UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string, data: UpdateRoleData): Promise<Role> {
    return this.roleRepository.update(id, data);
  }
}
