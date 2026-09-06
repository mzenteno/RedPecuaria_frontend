import { GetInvestorDashboardUseCaseImpl } from '@/application/dashboard/get-investor-dashboard.use-case.impl';
import { GetAdminDashboardUseCaseImpl } from '@/application/dashboard/get-admin-dashboard.use-case.impl';
import { DashboardRepositoryImpl } from '../repositories/dashboard/dashboard.repository.impl';

export const dashboardRepository = new DashboardRepositoryImpl();
export const getInvestorDashboardUseCase = new GetInvestorDashboardUseCaseImpl(dashboardRepository);
export const getAdminDashboardUseCase = new GetAdminDashboardUseCaseImpl(dashboardRepository);
