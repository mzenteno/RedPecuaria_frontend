import type { Company } from './company.entity';

export interface ListCompaniesUseCase {
  execute(): Promise<Company[]>;
}
