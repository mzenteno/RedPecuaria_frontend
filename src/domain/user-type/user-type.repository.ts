import type { UserType } from './user-type.entity';

export interface UserTypeRepository {
  /** `GET /user-types` — catálogo cerrado, sembrado por migración, sin CRUD propio (ver
   * docs/user-type/user-type.md del backend). */
  list(): Promise<UserType[]>;
}
