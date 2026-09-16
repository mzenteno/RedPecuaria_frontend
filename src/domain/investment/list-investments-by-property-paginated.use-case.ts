import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { InvestmentListItem } from './investment.entity';

export interface ListInvestmentsByPropertyPaginatedParams {
  propertyId: string;
  page: number;
  pageSize: number;
  gestion?: number;
  investorUserId?: string;
  search?: string;
}

export interface ListInvestmentsByPropertyPaginatedUseCase {
  execute(params: ListInvestmentsByPropertyPaginatedParams): Promise<PaginatedResult<InvestmentListItem>>;
}
