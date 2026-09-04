export interface LoginCredentials {
  username: string;
  password: string;
  /** Solo necesario si el usuario tiene más de una empresa activa. */
  companyId?: string;
}

/** Una opción del selector cuando el login devuelve CompanySelectionRequiredException. */
export interface CompanyChoice {
  companyId: string;
  companyName: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  companyId: string;
  /** Ausente solo tras un `switch-company` a una empresa donde el Super
   * Administrador no tiene una fila propia en `user_companies` — un login
   * normal siempre lo trae (ver `AccessTokenPayload.roleId` del backend). */
  roleId?: string;
}

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}
