import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { Property } from './property.entity';

export interface ListPropertiesUseCase {
  execute(params: PaginationParams): Promise<PaginatedResult<Property>>;
}
