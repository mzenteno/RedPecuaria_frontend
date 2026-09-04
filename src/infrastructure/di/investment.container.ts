import { CreateInvestmentUseCaseImpl } from '@/application/investment/create-investment.use-case.impl';
import { UpdateInvestmentUseCaseImpl } from '@/application/investment/update-investment.use-case.impl';
import { DeactivateInvestmentUseCaseImpl } from '@/application/investment/deactivate-investment.use-case.impl';
import { ListInvestmentsByPropertyUseCaseImpl } from '@/application/investment/list-investments-by-property.use-case.impl';
import { InvestmentRepositoryImpl } from '../repositories/investment/investment.repository.impl';

export const investmentRepository = new InvestmentRepositoryImpl();
export const createInvestmentUseCase = new CreateInvestmentUseCaseImpl(investmentRepository);
export const updateInvestmentUseCase = new UpdateInvestmentUseCaseImpl(investmentRepository);
export const deactivateInvestmentUseCase = new DeactivateInvestmentUseCaseImpl(investmentRepository);
export const listInvestmentsByPropertyUseCase = new ListInvestmentsByPropertyUseCaseImpl(investmentRepository);
