import type { GetInvestmentByIdUseCase } from '@/domain/investment/get-investment-by-id.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment } from '@/domain/investment/investment.entity';

export class GetInvestmentByIdUseCaseImpl implements GetInvestmentByIdUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(id: string): Promise<Investment> {
    return this.investmentRepository.getById(id);
  }
}
