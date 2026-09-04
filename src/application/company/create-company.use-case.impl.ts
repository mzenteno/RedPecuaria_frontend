import type { CreateCompanyUseCase } from '@/domain/company/create-company.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company, CreateCompanyData } from '@/domain/company/company.entity';

export class CreateCompanyUseCaseImpl implements CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(data: CreateCompanyData): Promise<Company> {
    return this.companyRepository.create(data);
  }
}
