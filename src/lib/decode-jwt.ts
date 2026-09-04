/**
 * Decodifica el payload de un JWT sin validar la firma — uso exclusivo para
 * mostrar datos (ej. el email en el topbar), nunca para decidir autorización.
 * La firma ya la validó el backend al emitir el token.
 */
export function decodeJwtPayload<T>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
