import type { KardexEntry, UpdateKardexEntryData } from './kardex-entry.entity';

export interface UpdateKardexEntryUseCase {
  execute(id: string, data: UpdateKardexEntryData): Promise<KardexEntry>;
}
