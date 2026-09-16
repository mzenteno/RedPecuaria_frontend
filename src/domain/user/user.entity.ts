export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userTypeId: string;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Solo para el listado (`GET /users`) — forma propia, no `extends User`:
 * el backend ya no manda `userTypeId` acá (dato muerto una vez resuelto
 * `userTypeName` con JOIN, ver `docs/user/changes/...`), así que declararlo
 * iría en contra de lo que de verdad llega en el JSON. Donde hace falta el
 * id del tipo (`UserDialog`) hay que resolverlo a partir de `userTypeName`,
 * no leer un campo que ya no existe. */
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userTypeName: string;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Forma mínima para un combo (`GET /users/options`) — a propósito NO
 * `extends User`: el backend solo manda `id`+`fullName` acá (ver
 * `docs/user/changes/...`). Usado por `useInvestorUsers` (combo
 * "Inversionista" de `InvestmentDialog`, tabla/PDF de Kardex). */
export interface UserOption {
  id: string;
  fullName: string;
}

/** Alta: además de los datos del usuario, exige elegir con qué rol arranca
 * (ver `RegisterUserUseCase` del backend — no existe "usuario sin empresa").
 * Sin `companyId`: siempre es sobre la empresa activa de la sesión, nunca un
 * valor elegido a mano en el diálogo (ver `CompanySwitcher`). */
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  userTypeId: string;
  roleId: string;
}

/** Edición: a propósito solo estos 2 campos — `username`, contraseña y
 * empresa/rol tienen sus propias acciones, no se tocan desde acá (mismo
 * criterio que el backend, ver `UpdateUserUseCase`). */
export type UpdateUserData = Pick<User, 'email' | 'fullName'>;

/** "Mi perfil" — cambiar la propia contraseña exige la actual (a diferencia
 * de `UpdateUserData`, que no pide nada más), ver `ChangeOwnPasswordUseCase`
 * del backend. Sin `userId`: siempre es el usuario logueado, el backend lo
 * resuelve del token, nunca de un parámetro. */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
