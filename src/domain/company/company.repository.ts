import type { Company, CreateCompanyData, UpdateCompanyData } from './company.entity';

/** Puerto — la implementación concreta (infrastructure) es la que sabe que existe una API REST. */
export interface CompanyRepository {
  list(): Promise<Company[]>;
  create(data: CreateCompanyData): Promise<Company>;
  update(id: string, data: UpdateCompanyData): Promise<Company>;
  deactivate(id: string): Promise<void>;
  uploadLogo(id: string, file: File): Promise<Company>;
  removeLogo(id: string): Promise<Company>;
}
