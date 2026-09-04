import type { UserCompanyLink } from './user-company.entity';

export interface GetUserRoleUseCase {
  execute(userId: string): Promise<UserCompanyLink>;
}
