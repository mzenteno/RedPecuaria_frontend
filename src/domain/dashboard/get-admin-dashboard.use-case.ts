import type { AdminDashboardSummary } from './dashboard.entity';

export interface GetAdminDashboardUseCase {
  execute(): Promise<AdminDashboardSummary>;
}
