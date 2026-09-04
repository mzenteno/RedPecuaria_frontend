import type { LoginUseCase } from '@/domain/auth/login.use-case';
import type { AuthRepository } from '@/domain/auth/auth.repository';
import type { AuthSession, LoginCredentials } from '@/domain/auth/auth.entity';

export class LoginUseCaseImpl implements LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
  }
}
