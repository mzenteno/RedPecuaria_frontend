import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { Investment } from './investment.entity';

export interface ListMyInvestmentsUseCase {
  execute(params: PaginationParams): Promise<PaginatedResult<Investment>>;
}
