import type { KardexEntry, CreateKardexEntryData } from './kardex-entry.entity';

export interface CreateKardexEntryUseCase {
  execute(data: CreateKardexEntryData): Promise<KardexEntry>;
}
