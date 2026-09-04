import type { UpdateInvestmentUseCase } from '@/domain/investment/update-investment.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment, UpdateInvestmentData } from '@/domain/investment/investment.entity';

export class UpdateInvestmentUseCaseImpl implements UpdateInvestmentUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(id: string, data: UpdateInvestmentData): Promise<Investment> {
    return this.investmentRepository.update(id, data);
  }
}
