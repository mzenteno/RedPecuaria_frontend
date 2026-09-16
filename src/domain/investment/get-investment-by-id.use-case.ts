import type { Investment } from './investment.entity';

export interface GetInvestmentByIdUseCase {
  execute(id: string): Promise<Investment>;
}
