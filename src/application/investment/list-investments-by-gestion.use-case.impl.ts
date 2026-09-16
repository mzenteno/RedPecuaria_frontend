import type {
  ListInvestmentsByGestionUseCase,
  ListInvestmentsByGestionParams,
} from '@/domain/investment/list-investments-by-gestion.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { InvestmentListItem } from '@/domain/investment/investment.entity';

export class ListInvestmentsByGestionUseCaseImpl implements ListInvestmentsByGestionUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(params: ListInvestmentsByGestionParams): Promise<PaginatedResult<InvestmentListItem>> {
    return this.investmentRepository.listByGestion(params);
  }
}
