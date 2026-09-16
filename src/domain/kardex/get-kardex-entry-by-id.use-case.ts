import type { KardexEntry } from './kardex-entry.entity';

export interface GetKardexEntryByIdUseCase {
  execute(id: string): Promise<KardexEntry>;
}
