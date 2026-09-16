import type { KardexEntriesPage } from './kardex-entry.repository';

export interface ListKardexEntriesParams {
  investmentId: string;
  page: number;
  pageSize: number;
  search?: string;
}

export interface ListKardexEntriesByInvestmentUseCase {
  execute(params: ListKardexEntriesParams): Promise<KardexEntriesPage>;
}
