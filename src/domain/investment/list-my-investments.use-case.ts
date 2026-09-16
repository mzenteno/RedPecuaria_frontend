import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { InvestmentListItem } from './investment.entity';

export interface ListMyInvestmentsUseCase {
  execute(params: PaginationParams): Promise<PaginatedResult<InvestmentListItem>>;
}
