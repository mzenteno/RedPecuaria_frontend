import type { GetAdminDashboardUseCase } from '@/domain/dashboard/get-admin-dashboard.use-case';
import type { DashboardRepository } from '@/domain/dashboard/dashboard.repository';
import type { AdminDashboardSummary } from '@/domain/dashboard/dashboard.entity';

export class GetAdminDashboardUseCaseImpl implements GetAdminDashboardUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(): Promise<AdminDashboardSummary> {
    return this.dashboardRepository.getAdminSummary();
  }
}
