import type { Company } from './company.entity';

export interface RemoveCompanyLogoUseCase {
  execute(id: string): Promise<Company>;
}
