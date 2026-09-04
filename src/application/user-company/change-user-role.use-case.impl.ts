import type { ChangeUserRoleUseCase } from '@/domain/user-company/change-user-role.use-case';
import type { UserCompanyRepository } from '@/domain/user-company/user-company.repository';
import type { UserCompanyLink } from '@/domain/user-company/user-company.entity';

export class ChangeUserRoleUseCaseImpl implements ChangeUserRoleUseCase {
  constructor(private readonly userCompanyRepository: UserCompanyRepository) {}

  async execute(userCompanyId: string, roleId: string): Promise<UserCompanyLink> {
    return this.userCompanyRepository.changeRole(userCompanyId, roleId);
  }
}
