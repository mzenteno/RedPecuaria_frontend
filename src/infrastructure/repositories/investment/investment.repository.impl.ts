import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment, CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';
import { httpClient } from '../../http/http-client';

export class InvestmentRepositoryImpl implements InvestmentRepository {
  async listByProperty(propertyId: string): Promise<Investment[]> {
    return httpClient.get<Investment[]>(`/investments?propertyId=${propertyId}`);
  }

  async create(data: CreateInvestmentData): Promise<Investment> {
    return httpClient.post<Investment>('/investments', data);
  }

  async update(id: string, data: UpdateInvestmentData): Promise<Investment> {
    return httpClient.patch<Investment>(`/investments/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/investments/${id}/deactivate`);
  }
}
