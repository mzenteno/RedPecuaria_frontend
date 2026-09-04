import type { CompanyRepository } from '@/domain/company/company.repository';
import type { Company, CreateCompanyData, UpdateCompanyData } from '@/domain/company/company.entity';
import { httpClient } from '../../http/http-client';

export class CompanyRepositoryImpl implements CompanyRepository {
  async list(): Promise<Company[]> {
    return httpClient.get<Company[]>('/companies');
  }

  async create(data: CreateCompanyData): Promise<Company> {
    return httpClient.post<Company>('/companies', data);
  }

  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    return httpClient.patch<Company>(`/companies/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/companies/${id}/deactivate`);
  }
}
