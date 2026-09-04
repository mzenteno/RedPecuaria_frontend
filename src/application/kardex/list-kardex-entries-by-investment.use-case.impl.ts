import type { ListKardexEntriesByInvestmentUseCase } from '@/domain/kardex/list-kardex-entries-by-investment.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { KardexEntry } from '@/domain/kardex/kardex-entry.entity';

export class ListKardexEntriesByInvestmentUseCaseImpl implements ListKardexEntriesByInvestmentUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(investmentId: string): Promise<KardexEntry[]> {
    return this.kardexEntryRepository.listByInvestment(investmentId);
  }
}
