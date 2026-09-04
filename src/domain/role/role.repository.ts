import type { Role, CreateRoleData, UpdateRoleData } from './role.entity';

/** Sin `companyId` en ningún método: el backend siempre opera sobre la
 * empresa activa de la sesión (`@CurrentUser('companyId')`), nunca un valor
 * que el cliente elija — ver `docs/role/role.md` del backend. */
export interface RoleRepository {
  /** `GET /roles`. */
  list(): Promise<Role[]>;
  create(data: CreateRoleData): Promise<Role>;
  update(id: string, data: UpdateRoleData): Promise<Role>;
  deactivate(id: string): Promise<void>;
}
