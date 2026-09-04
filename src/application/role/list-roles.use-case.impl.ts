import type { ListRolesUseCase } from '@/domain/role/list-roles.use-case';
import type { RoleRepository } from '@/domain/role/role.repository';
import type { Role } from '@/domain/role/role.entity';

export class ListRolesUseCaseImpl implements ListRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(): Promise<Role[]> {
    return this.roleRepository.list();
  }
}
