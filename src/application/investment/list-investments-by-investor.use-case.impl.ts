import type {
  ListInvestmentsByInvestorUseCase,
  ListInvestmentsByInvestorParams,
} from '@/domain/investment/list-investments-by-investor.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { Investment } from '@/domain/investment/investment.entity';

export class ListInvestmentsByInvestorUseCaseImpl implements ListInvestmentsByInvestorUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(params: ListInvestmentsByInvestorParams): Promise<PaginatedResult<Investment>> {
    return this.investmentRepository.listByInvestor(params);
  }
}
