import type { UserRepository } from '@/domain/user/user.repository';
import type { User, CreateUserData, UpdateUserData } from '@/domain/user/user.entity';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import { httpClient } from '../../http/http-client';

function buildQuery(params: PaginationParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search) {
    query.set('search', params.search);
  }
  return query.toString();
}

export class UserRepositoryImpl implements UserRepository {
  async list(params: PaginationParams): Promise<PaginatedResult<User>> {
    const result = await httpClient.getPaginated<User>(`/users?${buildQuery(params)}`);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    return httpClient.post<User>('/users', data);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return httpClient.patch<User>(`/users/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/users/${id}/deactivate`);
  }

  async changeUserType(id: string, userTypeId: string): Promise<void> {
    await httpClient.patch<void>(`/users/${id}/user-type`, { userTypeId });
  }
}
