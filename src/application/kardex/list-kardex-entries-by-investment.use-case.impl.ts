import type {
  ListKardexEntriesByInvestmentUseCase,
  ListKardexEntriesParams,
} from '@/domain/kardex/list-kardex-entries-by-investment.use-case';
import type { KardexEntryRepository, KardexEntriesPage } from '@/domain/kardex/kardex-entry.repository';

export class ListKardexEntriesByInvestmentUseCaseImpl implements ListKardexEntriesByInvestmentUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(params: ListKardexEntriesParams): Promise<KardexEntriesPage> {
    return this.kardexEntryRepository.listByInvestment(params);
  }
}
