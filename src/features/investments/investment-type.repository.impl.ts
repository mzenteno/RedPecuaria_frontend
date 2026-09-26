import { httpClient } from '@/infrastructure/http/http-client';
import type { InvestmentType } from './investment-type.entity';
import type { InvestmentTypeRepository } from './investment-type.repository';

export class InvestmentTypeRepositoryImpl implements InvestmentTypeRepository {
  async list(): Promise<InvestmentType[]> {
    return httpClient.get<InvestmentType[]>('/investment-types');
  }
}
