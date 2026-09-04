import type { CreateInvestmentUseCase } from '@/domain/investment/create-investment.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment, CreateInvestmentData } from '@/domain/investment/investment.entity';

export class CreateInvestmentUseCaseImpl implements CreateInvestmentUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(data: CreateInvestmentData): Promise<Investment> {
    return this.investmentRepository.create(data);
  }
}
