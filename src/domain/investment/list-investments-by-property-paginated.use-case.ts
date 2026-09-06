import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { Investment } from './investment.entity';

export interface ListInvestmentsByPropertyPaginatedParams {
  propertyId: string;
  page: number;
  pageSize: number;
  gestion?: number;
  investorUserId?: string;
  search?: string;
}

export interface ListInvestmentsByPropertyPaginatedUseCase {
  execute(params: ListInvestmentsByPropertyPaginatedParams): Promise<PaginatedResult<Investment>>;
}
