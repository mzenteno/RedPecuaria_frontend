'use client';

import { useState } from 'react';
import { getAccessToken } from '@/infrastructure/http/session-storage';
import { decodeJwtPayload } from '@/lib/decode-jwt';

interface TokenPayload {
  companyId: string;
}

function readActiveCompanyId(): string | null {
  const token = getAccessToken();
  return token ? (decodeJwtPayload<TokenPayload>(token)?.companyId ?? null) : null;
}

/**
 * Mismo patrón que `useIsSuperAdmin`/`useIsInvestor` (lazy initializer, sin
 * efecto) — la empresa ACTIVA de la sesión (no necesariamente la única a la
 * que pertenece el usuario, ver `docs/user-company/user-company.md`). Sirve
 * para cruzar contra `useCompanies()` y sacar sus datos completos (ej.
 * `logoUrl` para el PDF del Kardex) sin depender de que el token los lleve
 * — el token solo lleva el id, no puede quedar desactualizado si el logo
 * cambia sin volver a loguearse.
 */
export function useActiveCompanyId(): string | null {
  const [companyId] = useState(readActiveCompanyId);
  return companyId;
}
