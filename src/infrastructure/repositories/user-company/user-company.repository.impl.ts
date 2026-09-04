import type { UserCompanyRepository } from '@/domain/user-company/user-company.repository';
import type { UserCompanyLink } from '@/domain/user-company/user-company.entity';
import { httpClient } from '../../http/http-client';

export class UserCompanyRepositoryImpl implements UserCompanyRepository {
  async getRole(userId: string): Promise<UserCompanyLink> {
    return httpClient.get<UserCompanyLink>(`/users/${userId}/role`);
  }

  async changeRole(userCompanyId: string, roleId: string): Promise<UserCompanyLink> {
    return httpClient.patch<UserCompanyLink>(`/user-companies/${userCompanyId}/role`, { roleId });
  }
}
