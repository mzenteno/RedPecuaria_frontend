import type { Company } from './company.entity';

export interface UploadCompanyLogoUseCase {
  execute(id: string, file: File): Promise<Company>;
}
