import type { UserCompanyLink } from './user-company.entity';

export interface UserCompanyRepository {
  /** `GET /users/:userId/role` — el vínculo del usuario en la empresa
   * activa de quien pregunta (nunca una empresa elegida a mano). */
  getRole(userId: string): Promise<UserCompanyLink>;
  /** `PATCH /user-companies/:id/role`. */
  changeRole(userCompanyId: string, roleId: string): Promise<UserCompanyLink>;
}
