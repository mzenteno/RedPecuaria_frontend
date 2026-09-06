import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { Investment } from './investment.entity';

export interface ListInvestmentsByInvestorParams {
  investorUserId: string;
  page: number;
  pageSize: number;
  propertyId?: string;
  search?: string;
}

export interface ListInvestmentsByInvestorUseCase {
  execute(params: ListInvestmentsByInvestorParams): Promise<PaginatedResult<Investment>>;
}
