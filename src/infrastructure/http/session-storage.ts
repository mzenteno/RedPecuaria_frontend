import type { AuthSession } from '@/domain/auth/auth.entity';

/**
 * Persistencia de la sesión en `localStorage`. Deliberadamente simple para
 * esta entrega (mismo criterio pragmático que el backend): no hay cookies
 * httpOnly ni protección contra XSS a nivel de storage. Documentado como
 * límite conocido en el ARCHITECTURE.md del frontend.
 */
const ACCESS_TOKEN_KEY = 'rp_access_token';
const REFRESH_TOKEN_KEY = 'rp_refresh_token';
const USER_ID_KEY = 'rp_user_id';
const COMPANY_ID_KEY = 'rp_company_id';
const ROLE_ID_KEY = 'rp_role_id';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function saveSession(session: AuthSession): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  window.localStorage.setItem(USER_ID_KEY, session.userId);
  window.localStorage.setItem(COMPANY_ID_KEY, session.companyId);
  // Ausente tras un switch-company a una empresa sin rol propio (Super
  // Administrador) — no borra una key que no vino, solo la deja vacía.
  if (session.roleId !== undefined) {
    window.localStorage.setItem(ROLE_ID_KEY, session.roleId);
  } else {
    window.localStorage.removeItem(ROLE_ID_KEY);
  }
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, COMPANY_ID_KEY, ROLE_ID_KEY].forEach((key) =>
    window.localStorage.removeItem(key),
  );
}

export function getAccessToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
}

export function getUserId(): string | null {
  return isBrowser() ? window.localStorage.getItem(USER_ID_KEY) : null;
}

export function getCompanyId(): string | null {
  return isBrowser() ? window.localStorage.getItem(COMPANY_ID_KEY) : null;
}

export function getRoleId(): string | null {
  return isBrowser() ? window.localStorage.getItem(ROLE_ID_KEY) : null;
}
