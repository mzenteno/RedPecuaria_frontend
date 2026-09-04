'use client';

import { useState } from 'react';
import { getAccessToken } from '@/infrastructure/http/session-storage';
import { decodeJwtPayload } from '@/lib/decode-jwt';

interface TokenPayload {
  isSuperAdmin: boolean;
}

function readIsSuperAdmin(): boolean {
  const token = getAccessToken();
  return token ? (decodeJwtPayload<TokenPayload>(token)?.isSuperAdmin ?? false) : false;
}

/**
 * Mismo patrón que `topbar.tsx` (lazy initializer de `useState`, sin efecto):
 * seguro acá porque este hook solo se usa dentro de `(main)/*`, que ya
 * garantiza que el primer render ocurre después de la hidratación (ver
 * `(main)/layout.tsx`) — no hay riesgo de mismatch servidor/cliente.
 */
export function useIsSuperAdmin(): boolean {
  const [isSuperAdmin] = useState(readIsSuperAdmin);
  return isSuperAdmin;
}
