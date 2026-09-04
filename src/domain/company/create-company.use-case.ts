import type { Company, CreateCompanyData } from './company.entity';

export interface CreateCompanyUseCase {
  execute(data: CreateCompanyData): Promise<Company>;
}
