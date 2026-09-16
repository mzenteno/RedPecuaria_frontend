import type { ListMyInvestmentsUseCase } from '@/domain/investment/list-my-investments.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { InvestmentListItem } from '@/domain/investment/investment.entity';

export class ListMyInvestmentsUseCaseImpl implements ListMyInvestmentsUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<InvestmentListItem>> {
    return this.investmentRepository.listMine(params);
  }
}
