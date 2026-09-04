import type { AuthRepository } from '@/domain/auth/auth.repository';
import type { AuthSession, LoginCredentials, RefreshedTokens } from '@/domain/auth/auth.entity';
import { httpClient } from '../../http/http-client';

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return httpClient.post<AuthSession>('/auth/login', credentials);
  }

  async logout(refreshToken: string): Promise<void> {
    await httpClient.post<void>('/auth/logout', { refreshToken });
  }

  async refresh(refreshToken: string): Promise<RefreshedTokens> {
    return httpClient.post<RefreshedTokens>('/auth/refresh', { refreshToken });
  }

  async switchCompany(companyId: string): Promise<AuthSession> {
    return httpClient.post<AuthSession>('/auth/switch-company', { companyId });
  }
}
