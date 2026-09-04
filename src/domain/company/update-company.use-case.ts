import type { Company, UpdateCompanyData } from './company.entity';

export interface UpdateCompanyUseCase {
  execute(id: string, data: UpdateCompanyData): Promise<Company>;
}
