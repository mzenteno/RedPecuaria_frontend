import type { UserCompanyLink } from './user-company.entity';

export interface ChangeUserRoleUseCase {
  execute(userCompanyId: string, roleId: string): Promise<UserCompanyLink>;
}
