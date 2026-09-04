import type { AuthSession, LoginCredentials } from './auth.entity';

export interface LoginUseCase {
  execute(credentials: LoginCredentials): Promise<AuthSession>;
}
