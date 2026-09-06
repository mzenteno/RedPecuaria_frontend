import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { KardexEntry } from './kardex-entry.entity';

export interface ListKardexEntriesParams {
  investmentId: string;
  page: number;
  pageSize: number;
  search?: string;
}

export interface ListKardexEntriesByInvestmentUseCase {
  execute(params: ListKardexEntriesParams): Promise<PaginatedResult<KardexEntry>>;
}
