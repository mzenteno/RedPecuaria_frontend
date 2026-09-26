import { CompanyRepositoryImpl } from '@/infrastructure/repositories/company/company.repository.impl';
import { ListCompaniesUseCaseImpl } from '@/application/company/list-companies.use-case.impl';
import { CreateCompanyUseCaseImpl } from '@/application/company/create-company.use-case.impl';
import { UpdateCompanyUseCaseImpl } from '@/application/company/update-company.use-case.impl';
import { DeactivateCompanyUseCaseImpl } from '@/application/company/deactivate-company.use-case.impl';
import { UploadCompanyLogoUseCaseImpl } from '@/application/company/upload-company-logo.use-case.impl';
import { RemoveCompanyLogoUseCaseImpl } from '@/application/company/remove-company-logo.use-case.impl';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { ListCompaniesUseCase } from '@/domain/company/list-companies.use-case';
import type { CreateCompanyUseCase } from '@/domain/company/create-company.use-case';
import type { UpdateCompanyUseCase } from '@/domain/company/update-company.use-case';
import type { DeactivateCompanyUseCase } from '@/domain/company/deactivate-company.use-case';
import type { UploadCompanyLogoUseCase } from '@/domain/company/upload-company-logo.use-case';
import type { RemoveCompanyLogoUseCase } from '@/domain/company/remove-company-logo.use-case';

const companyRepository: CompanyRepository = new CompanyRepositoryImpl();

export const listCompaniesUseCase: ListCompaniesUseCase = new ListCompaniesUseCaseImpl(companyRepository);
export const createCompanyUseCase: CreateCompanyUseCase = new CreateCompanyUseCaseImpl(companyRepository);
export const updateCompanyUseCase: UpdateCompanyUseCase = new UpdateCompanyUseCaseImpl(companyRepository);
export const deactivateCompanyUseCase: DeactivateCompanyUseCase = new DeactivateCompanyUseCaseImpl(companyRepository);
export const uploadCompanyLogoUseCase: UploadCompanyLogoUseCase = new UploadCompanyLogoUseCaseImpl(companyRepository);
export const removeCompanyLogoUseCase: RemoveCompanyLogoUseCase = new RemoveCompanyLogoUseCaseImpl(companyRepository);
