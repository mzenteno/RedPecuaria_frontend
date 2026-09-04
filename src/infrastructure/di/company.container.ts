import { CompanyRepositoryImpl } from '@/infrastructure/repositories/company/company.repository.impl';
import { ListCompaniesUseCaseImpl } from '@/application/company/list-companies.use-case.impl';
import { CreateCompanyUseCaseImpl } from '@/application/company/create-company.use-case.impl';
import { UpdateCompanyUseCaseImpl } from '@/application/company/update-company.use-case.impl';
import { DeactivateCompanyUseCaseImpl } from '@/application/company/deactivate-company.use-case.impl';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { ListCompaniesUseCase } from '@/domain/company/list-companies.use-case';
import type { CreateCompanyUseCase } from '@/domain/company/create-company.use-case';
import type { UpdateCompanyUseCase } from '@/domain/company/update-company.use-case';
import type { DeactivateCompanyUseCase } from '@/domain/company/deactivate-company.use-case';

const companyRepository: CompanyRepository = new CompanyRepositoryImpl();

export const listCompaniesUseCase: ListCompaniesUseCase = new ListCompaniesUseCaseImpl(companyRepository);
export const createCompanyUseCase: CreateCompanyUseCase = new CreateCompanyUseCaseImpl(companyRepository);
export const updateCompanyUseCase: UpdateCompanyUseCase = new UpdateCompanyUseCaseImpl(companyRepository);
export const deactivateCompanyUseCase: DeactivateCompanyUseCase = new DeactivateCompanyUseCaseImpl(companyRepository);
