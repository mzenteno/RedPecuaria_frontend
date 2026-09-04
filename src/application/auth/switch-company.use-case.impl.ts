import type { SwitchCompanyUseCase } from '@/domain/auth/switch-company.use-case';
import type { AuthRepository } from '@/domain/auth/auth.repository';
import type { AuthSession } from '@/domain/auth/auth.entity';

export class SwitchCompanyUseCaseImpl implements SwitchCompanyUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(companyId: string): Promise<AuthSession> {
    return this.authRepository.switchCompany(companyId);
  }
}
