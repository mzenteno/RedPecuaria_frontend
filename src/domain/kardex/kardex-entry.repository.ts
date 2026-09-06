import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { ListKardexEntriesParams } from './list-kardex-entries-by-investment.use-case';
import type { KardexEntry, CreateKardexEntryData, UpdateKardexEntryData } from './kardex-entry.entity';

export interface KardexEntryRepository {
  listByInvestment(params: ListKardexEntriesParams): Promise<PaginatedResult<KardexEntry>>;
  create(data: CreateKardexEntryData): Promise<KardexEntry>;
  update(id: string, data: UpdateKardexEntryData): Promise<KardexEntry>;
  deactivate(id: string): Promise<void>;
}
