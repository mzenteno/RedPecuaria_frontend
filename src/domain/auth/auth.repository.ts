import type { AuthSession, LoginCredentials, RefreshedTokens } from './auth.entity';

/** Puerto — la implementación concreta (infrastructure) es la que sabe que existe una API REST. */
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<RefreshedTokens>;
  /** Solo Super Administrador — `POST /auth/switch-company` (ver
   * `docs/auth-sessions/auth-sessions.md` del backend). */
  switchCompany(companyId: string): Promise<AuthSession>;
}
