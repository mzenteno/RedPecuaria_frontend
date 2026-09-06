import type { DashboardRepository } from '@/domain/dashboard/dashboard.repository';
import type { InvestorDashboardSummary, AdminDashboardSummary } from '@/domain/dashboard/dashboard.entity';
import { httpClient } from '../../http/http-client';

export class DashboardRepositoryImpl implements DashboardRepository {
  async getInvestorSummary(): Promise<InvestorDashboardSummary> {
    return httpClient.get<InvestorDashboardSummary>('/dashboard/investor-summary');
  }

  async getAdminSummary(): Promise<AdminDashboardSummary> {
    return httpClient.get<AdminDashboardSummary>('/dashboard/admin-summary');
  }
}
