import type { Investment, CreateInvestmentData } from './investment.entity';

export interface CreateInvestmentUseCase {
  execute(data: CreateInvestmentData): Promise<Investment>;
}
