import type { InvestorDashboardSummary } from './dashboard.entity';

export interface GetInvestorDashboardUseCase {
  execute(): Promise<InvestorDashboardSummary>;
}
