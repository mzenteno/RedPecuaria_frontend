import type { ListUsersUseCase } from '@/domain/user/list-users.use-case';
import type { UserRepository } from '@/domain/user/user.repository';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { UserListItem } from '@/domain/user/user.entity';

export class ListUsersUseCaseImpl implements ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<UserListItem>> {
    return this.userRepository.list(params);
  }
}
