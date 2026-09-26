import { clearSession, getAccessToken, getRefreshToken, saveTokens } from './session-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Forma exacta del envoltorio de la API real (ver ARCHITECTURE.md §6 del
 * backend) — no un formato genérico inventado.
 */
interface ApiSuccessEnvelope<T, M extends object = object> {
  success: true;
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
  /** Solo presente en listados paginados por el servidor (ej. `GET /users`)
   * — el `ResponseInterceptor` del backend lo sube a este nivel en vez de
   * anidarlo dentro de `data` (ver ARCHITECTURE.md §6 del backend). `M`:
   * algunos listados agregan campos propios acá (ej. `totalDebe`/
   * `totalHaber` en Kardex) — default `object` para no afectar al resto. */
  meta?: { total: number; page: number; pageSize: number } & M;
}

interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string | string[];
  /** Datos extra que algunas excepciones de dominio adjuntan (ej. las
   * empresas para elegir en CompanySelectionRequiredException). */
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorName: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Evita el "thundering herd": si varias requests reciben 401 al mismo
 * tiempo, solo la primera dispara el refresh real; las demás esperan la
 * misma promesa en vez de refrescar cada una por su cuenta.
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const body = (await response.json()) as ApiSuccessEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>;
    if (!body.success) return false;

    saveTokens(body.data.accessToken, body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function redirectToLogin(): void {
  clearSession();
  if (typeof window !== 'undefined') {
    // Recarga dura a propósito (no router.push): este módulo no es un
    // componente/hook, y al expirar la sesión conviene resetear también el
    // cache de React Query y cualquier estado en memoria, no solo navegar.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
}

/** `null` = 204 No Content (ej. logout) — no hay body que parsear. */
async function requestEnvelope<T, M extends object = object>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<ApiSuccessEnvelope<T, M> | null> {
  const accessToken = getAccessToken();
  // `FormData` (subida de archivos, ver `postForm`) nunca lleva
  // `Content-Type` a mano — el navegador arma uno propio con el boundary
  // multipart, que no se puede reproducir manualmente. Fijarlo igual (aunque
  // sea "application/json") rompe el multipart del lado del servidor.
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && !isRetry && getRefreshToken()) {
    refreshPromise ??= refreshSession().finally(() => {
      refreshPromise = null;
    });
    const refreshed = await refreshPromise;
    if (refreshed) {
      return requestEnvelope<T, M>(path, options, true);
    }
    redirectToLogin();
    throw new ApiError(401, 'Unauthorized', 'La sesión expiró, iniciá sesión de nuevo');
  }

  if (response.status === 204) {
    return null;
  }

  const body = (await response.json().catch(() => null)) as
    | ApiSuccessEnvelope<T, M>
    | ApiErrorEnvelope
    | null;

  if (!body || body.success === false) {
    const rawMessage = body && !body.success ? body.message : 'Error de red inesperado';
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
    const errorName = body && !body.success ? body.error : 'NetworkError';
    const details = body && !body.success ? body.details : undefined;
    throw new ApiError(response.status, errorName, message, details);
  }

  return body;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const envelope = await requestEnvelope<T>(path, options);
  return envelope ? envelope.data : (undefined as T);
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Para listados que el backend pagina de verdad (ej. `GET /users`) — a
 * diferencia de `get`, no descarta `meta`. `M`: para listados que agregan
 * campos propios a `meta` (ej. `totalDebe`/`totalHaber` en Kardex) — default
 * `object`, así ningún otro llamador (que no pasa `M`) se ve afectado. */
async function getPaginated<T, M extends object = object>(
  path: string,
): Promise<PaginatedResponse<T> & M> {
  const envelope = await requestEnvelope<T[], M>(path, { method: 'GET' });
  if (!envelope || !envelope.meta) {
    throw new Error(`Se esperaba una respuesta paginada (con "meta") de ${path}`);
  }
  const { total, page, pageSize, ...extra } = envelope.meta;
  return { items: envelope.data, total, page, pageSize, ...extra } as PaginatedResponse<T> & M;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  getPaginated,
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  /** Para subir archivos (ej. el logo de una empresa) — `formData` viaja
   * como `multipart/form-data`, nunca como JSON. */
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
