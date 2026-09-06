export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isDeleted: boolean;
  userTypeId: string;
  lastLoginAt: string | null;
  createdAt: string;
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
