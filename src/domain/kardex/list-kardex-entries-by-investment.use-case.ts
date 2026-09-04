import type { KardexEntry } from './kardex-entry.entity';

export interface ListKardexEntriesByInvestmentUseCase {
  execute(investmentId: string): Promise<KardexEntry[]>;
}
