import type { RemoveCompanyLogoUseCase } from '@/domain/company/remove-company-logo.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company } from '@/domain/company/company.entity';

export class RemoveCompanyLogoUseCaseImpl implements RemoveCompanyLogoUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<Company> {
    return this.companyRepository.removeLogo(id);
  }
}
