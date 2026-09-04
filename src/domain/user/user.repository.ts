import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { User, CreateUserData, UpdateUserData } from './user.entity';

export interface UserRepository {
  /** `GET /users?page=&pageSize=&search=` — paginado en el servidor, a
   * diferencia de `CompanyRepository.list()`. */
  list(params: PaginationParams): Promise<PaginatedResult<User>>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deactivate(id: string): Promise<void>;
  /** `PATCH /users/:id/user-type` — acción separada de `update`, mismo
   * criterio que el backend (`UpdateUserUseCase` no toca `userTypeId`). */
  changeUserType(id: string, userTypeId: string): Promise<void>;
}
