import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { UserListItem } from './user.entity';

export interface ListUsersUseCase {
  execute(params: PaginationParams): Promise<PaginatedResult<UserListItem>>;
}
