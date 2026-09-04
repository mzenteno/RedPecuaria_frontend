import type { Role } from './role.entity';

export interface ListRolesUseCase {
  execute(): Promise<Role[]>;
}
