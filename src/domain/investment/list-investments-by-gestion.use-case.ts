import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { InvestmentListItem } from './investment.entity';

export interface ListInvestmentsByGestionParams {
  gestion: number;
  page: number;
  pageSize: number;
  propertyId?: string;
  investorUserId?: string;
  search?: string;
}

export interface ListInvestmentsByGestionUseCase {
  execute(params: ListInvestmentsByGestionParams): Promise<PaginatedResult<InvestmentListItem>>;
}
