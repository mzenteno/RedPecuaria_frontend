import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { KardexEntry, CreateKardexEntryData, UpdateKardexEntryData } from '@/domain/kardex/kardex-entry.entity';
import { httpClient } from '../../http/http-client';

export class KardexEntryRepositoryImpl implements KardexEntryRepository {
  async listByInvestment(investmentId: string): Promise<KardexEntry[]> {
    return httpClient.get<KardexEntry[]>(`/kardex-entries?investmentId=${investmentId}`);
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
