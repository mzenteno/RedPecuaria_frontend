import { CreateInvestmentUseCaseImpl } from '@/application/investment/create-investment.use-case.impl';
import { UpdateInvestmentUseCaseImpl } from '@/application/investment/update-investment.use-case.impl';
import { DeactivateInvestmentUseCaseImpl } from '@/application/investment/deactivate-investment.use-case.impl';
import { ListMyInvestmentsUseCaseImpl } from '@/application/investment/list-my-investments.use-case.impl';
import { ListInvestmentsByGestionUseCaseImpl } from '@/application/investment/list-investments-by-gestion.use-case.impl';
import { ListInvestmentsByPropertyPaginatedUseCaseImpl } from '@/application/investment/list-investments-by-property-paginated.use-case.impl';
import { ListInvestmentsByInvestorUseCaseImpl } from '@/application/investment/list-investments-by-investor.use-case.impl';
import { GetInvestmentByIdUseCaseImpl } from '@/application/investment/get-investment-by-id.use-case.impl';
import { InvestmentRepositoryImpl } from '../repositories/investment/investment.repository.impl';

export const investmentRepository = new InvestmentRepositoryImpl();
export const createInvestmentUseCase = new CreateInvestmentUseCaseImpl(investmentRepository);
export const updateInvestmentUseCase = new UpdateInvestmentUseCaseImpl(investmentRepository);
export const deactivateInvestmentUseCase = new DeactivateInvestmentUseCaseImpl(investmentRepository);
export const listMyInvestmentsUseCase = new ListMyInvestmentsUseCaseImpl(investmentRepository);
export const listInvestmentsByGestionUseCase = new ListInvestmentsByGestionUseCaseImpl(investmentRepository);
export const listInvestmentsByPropertyPaginatedUseCase = new ListInvestmentsByPropertyPaginatedUseCaseImpl(
  investmentRepository,
);
export const listInvestmentsByInvestorUseCase = new ListInvestmentsByInvestorUseCaseImpl(investmentRepository);
export const getInvestmentByIdUseCase = new GetInvestmentByIdUseCaseImpl(investmentRepository);
