import type { UpdateCompanyUseCase } from '@/domain/company/update-company.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company, UpdateCompanyData } from '@/domain/company/company.entity';

export class UpdateCompanyUseCaseImpl implements UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string, data: UpdateCompanyData): Promise<Company> {
    return this.companyRepository.update(id, data);
  }
}
