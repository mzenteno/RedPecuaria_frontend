import type { ListCompaniesUseCase } from '@/domain/company/list-companies.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company } from '@/domain/company/company.entity';

export class ListCompaniesUseCaseImpl implements ListCompaniesUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(): Promise<Company[]> {
    return this.companyRepository.list();
  }
}
