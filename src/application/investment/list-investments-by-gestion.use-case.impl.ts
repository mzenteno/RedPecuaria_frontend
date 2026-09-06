import type {
  ListInvestmentsByGestionUseCase,
  ListInvestmentsByGestionParams,
} from '@/domain/investment/list-investments-by-gestion.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { Investment } from '@/domain/investment/investment.entity';

export class ListInvestmentsByGestionUseCaseImpl implements ListInvestmentsByGestionUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(params: ListInvestmentsByGestionParams): Promise<PaginatedResult<Investment>> {
    return this.investmentRepository.listByGestion(params);
  }
}
