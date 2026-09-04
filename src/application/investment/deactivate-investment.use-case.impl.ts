import type { DeactivateInvestmentUseCase } from '@/domain/investment/deactivate-investment.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';

export class DeactivateInvestmentUseCaseImpl implements DeactivateInvestmentUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(id: string): Promise<void> {
    await this.investmentRepository.deactivate(id);
  }
}
