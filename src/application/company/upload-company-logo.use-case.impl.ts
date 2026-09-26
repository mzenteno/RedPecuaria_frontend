import type { UploadCompanyLogoUseCase } from '@/domain/company/upload-company-logo.use-case';
import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company } from '@/domain/company/company.entity';

export class UploadCompanyLogoUseCaseImpl implements UploadCompanyLogoUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(id: string, file: File): Promise<Company> {
    return this.companyRepository.uploadLogo(id, file);
  }
}
