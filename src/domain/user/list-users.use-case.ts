import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { User } from './user.entity';

export interface ListUsersUseCase {
  execute(params: PaginationParams): Promise<PaginatedResult<User>>;
}
