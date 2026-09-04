import type { DeactivateCompanyUseCase } from '@/domain/company/deactivate-company.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';

export class DeactivateCompanyUseCaseImpl implements DeactivateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string): Promise<void> {
    return this.companyRepository.deactivate(id);
  }
}
