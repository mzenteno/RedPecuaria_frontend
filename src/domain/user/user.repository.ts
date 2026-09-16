import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { User, UserListItem, UserOption, CreateUserData, UpdateUserData, ChangePasswordData } from './user.entity';

export interface ListUserOptionsParams {
  userTypeId?: string;
}

export interface UserRepository {
  /** `GET /users?page=&pageSize=&search=` — paginado en el servidor, a
   * diferencia de `CompanyRepository.list()`. */
  list(params: PaginationParams): Promise<PaginatedResult<UserListItem>>;
  /** `GET /users/options?userTypeId=` — liviano y sin paginar, para combos
   * (ver `UserOption`). */
  listOptions(params?: ListUserOptionsParams): Promise<UserOption[]>;
  /** `GET /users/:id` — detalle completo, para quien necesite más que lo que
   * trae `list()` (a propósito liviano, ver `UserListItem`). El diálogo de
   * edición pide esto en vez de cruzar datos del listado con otro catálogo. */
  getById(id: string): Promise<User>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deactivate(id: string): Promise<void>;
  /** `PATCH /users/:id/user-type` — acción separada de `update`, mismo
   * criterio que el backend (`UpdateUserUseCase` no toca `userTypeId`). */
  changeUserType(id: string, userTypeId: string): Promise<void>;
  /** `PATCH /users/me/password` — sin `id`: siempre el usuario logueado,
   * resuelto del token en el backend (ver `ChangeOwnPasswordUseCase`). */
  changeOwnPassword(data: ChangePasswordData): Promise<void>;
}
