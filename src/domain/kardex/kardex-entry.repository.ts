import type { KardexEntry, CreateKardexEntryData, UpdateKardexEntryData } from './kardex-entry.entity';

export interface KardexEntryRepository {
  listByInvestment(investmentId: string): Promise<KardexEntry[]>;
  create(data: CreateKardexEntryData): Promise<KardexEntry>;
  update(id: string, data: UpdateKardexEntryData): Promise<KardexEntry>;
  deactivate(id: string): Promise<void>;
}
