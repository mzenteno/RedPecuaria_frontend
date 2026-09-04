import type { CreateRoleUseCase } from '@/domain/role/create-role.use-case';
import type { RoleRepository } from '@/domain/role/role.repository';
import type { Role, CreateRoleData } from '@/domain/role/role.entity';

export class CreateRoleUseCaseImpl implements CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(data: CreateRoleData): Promise<Role> {
    return this.roleRepository.create(data);
  }
}
