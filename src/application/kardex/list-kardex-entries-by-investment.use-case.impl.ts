import type {
  ListKardexEntriesByInvestmentUseCase,
  ListKardexEntriesParams,
} from '@/domain/kardex/list-kardex-entries-by-investment.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';

export class ListKardexEntriesByInvestmentUseCaseImpl implements ListKardexEntriesByInvestmentUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(params: ListKardexEntriesParams): Promise<PaginatedResult<KardexEntryListItem>> {
    return this.kardexEntryRepository.listByInvestment(params);
  }
}
