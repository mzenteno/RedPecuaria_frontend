import type { ListInvestmentsByPropertyUseCase } from '@/domain/investment/list-investments-by-property.use-case';
import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment } from '@/domain/investment/investment.entity';

export class ListInvestmentsByPropertyUseCaseImpl implements ListInvestmentsByPropertyUseCase {
  constructor(private readonly investmentRepository: InvestmentRepository) {}

  async execute(propertyId: string): Promise<Investment[]> {
    return this.investmentRepository.listByProperty(propertyId);
  }
}
