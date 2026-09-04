import type { DeactivateRoleUseCase } from '@/domain/role/deactivate-role.use-case';
import type { RoleRepository } from '@/domain/role/role.repository';

export class DeactivateRoleUseCaseImpl implements DeactivateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string): Promise<void> {
    await this.roleRepository.deactivate(id);
  }
}
