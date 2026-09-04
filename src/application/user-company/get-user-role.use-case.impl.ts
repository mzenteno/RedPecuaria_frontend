import type { GetUserRoleUseCase } from '@/domain/user-company/get-user-role.use-case';
import type { UserCompanyRepository } from '@/domain/user-company/user-company.repository';
import type { UserCompanyLink } from '@/domain/user-company/user-company.entity';

export class GetUserRoleUseCaseImpl implements GetUserRoleUseCase {
  constructor(private readonly userCompanyRepository: UserCompanyRepository) {}

  async execute(userId: string): Promise<UserCompanyLink> {
    return this.userCompanyRepository.getRole(userId);
  }
}
