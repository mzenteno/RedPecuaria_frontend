import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { ListKardexEntriesParams } from '@/domain/kardex/list-kardex-entries-by-investment.use-case';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type {
  KardexEntry,
  KardexEntryListItem,
  CreateKardexEntryData,
  UpdateKardexEntryData,
} from '@/domain/kardex/kardex-entry.entity';
import { httpClient } from '../../http/http-client';

export class KardexEntryRepositoryImpl implements KardexEntryRepository {
  async listByInvestment(params: ListKardexEntriesParams): Promise<PaginatedResult<KardexEntryListItem>> {
    const query = new URLSearchParams({
      investmentId: params.investmentId,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.search) {
      query.set('search', params.search);
    }
    const result = await httpClient.getPaginated<KardexEntryListItem>(`/kardex-entries?${query.toString()}`);
    return { items: result.items, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  async create(data: CreateKardexEntryData): Promise<KardexEntry> {
    return httpClient.post<KardexEntry>('/kardex-entries', data);
  }

  async update(id: string, data: UpdateKardexEntryData): Promise<KardexEntry> {
    return httpClient.patch<KardexEntry>(`/kardex-entries/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/kardex-entries/${id}/deactivate`);
  }
}
