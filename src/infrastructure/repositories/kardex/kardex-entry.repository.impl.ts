import type { KardexEntryRepository, KardexEntriesPage } from '@/domain/kardex/kardex-entry.repository';
import type { ListKardexEntriesParams } from '@/domain/kardex/list-kardex-entries-by-investment.use-case';
import type {
  KardexEntry,
  KardexEntryListItem,
  CreateKardexEntryData,
  UpdateKardexEntryData,
} from '@/domain/kardex/kardex-entry.entity';
import { httpClient } from '../../http/http-client';

export class KardexEntryRepositoryImpl implements KardexEntryRepository {
  async listByInvestment(params: ListKardexEntriesParams): Promise<KardexEntriesPage> {
    const query = new URLSearchParams({
      investmentId: params.investmentId,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.search) {
      query.set('search', params.search);
    }
    const result = await httpClient.getPaginated<KardexEntryListItem, { totalDebe: number; totalHaber: number }>(
      `/kardex-entries?${query.toString()}`,
    );
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalDebe: result.totalDebe,
      totalHaber: result.totalHaber,
    };
  }

  async getById(id: string): Promise<KardexEntry> {
    return httpClient.get<KardexEntry>(`/kardex-entries/${id}`);
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
