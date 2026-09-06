import type { GetInvestorDashboardUseCase } from '@/domain/dashboard/get-investor-dashboard.use-case';
import type { DashboardRepository } from '@/domain/dashboard/dashboard.repository';
import type { InvestorDashboardSummary } from '@/domain/dashboard/dashboard.entity';

export class GetInvestorDashboardUseCaseImpl implements GetInvestorDashboardUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(): Promise<InvestorDashboardSummary> {
    return this.dashboardRepository.getInvestorSummary();
  }
}
