import type { Investment, UpdateInvestmentData } from './investment.entity';

export interface UpdateInvestmentUseCase {
  execute(id: string, data: UpdateInvestmentData): Promise<Investment>;
}
