import type { InvestorDashboardSummary, AdminDashboardSummary } from './dashboard.entity';

export interface DashboardRepository {
  getInvestorSummary(): Promise<InvestorDashboardSummary>;
  getAdminSummary(): Promise<AdminDashboardSummary>;
}
