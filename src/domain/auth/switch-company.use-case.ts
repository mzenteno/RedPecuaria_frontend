import type { AuthSession } from './auth.entity';

export interface SwitchCompanyUseCase {
  execute(companyId: string): Promise<AuthSession>;
}
