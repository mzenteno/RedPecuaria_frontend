import type { Investment } from './investment.entity';

export interface ListInvestmentsByPropertyUseCase {
  execute(propertyId: string): Promise<Investment[]>;
}
