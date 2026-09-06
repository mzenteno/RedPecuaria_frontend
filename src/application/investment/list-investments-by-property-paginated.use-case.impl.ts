import type {
  ListInvestmentsByPropertyPaginatedUseCase,
  ListInvestmentsByPropertyPaginatedParams,
} from '@/domain/investment/list-investments-by-property-paginated.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { Investment } from '@/domain/investment/investment.entity';

export class ListInvestmentsByPropertyPaginatedUseCaseImpl implements ListInvestmentsByPropertyPaginatedUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(params: ListInvestmentsByPropertyPaginatedParams): Promise<PaginatedResult<Investment>> {
    return this.investmentRepository.listByPropertyPaginated(params);
  }
}
