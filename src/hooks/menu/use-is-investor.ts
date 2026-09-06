'use client';

import { useState } from 'react';
import { getAccessToken } from '@/infrastructure/http/session-storage';
import { decodeJwtPayload } from '@/lib/decode-jwt';

interface TokenPayload {
  isInvestor: boolean;
}

function readIsInvestor(): boolean {
  const token = getAccessToken();
  return token ? (decodeJwtPayload<TokenPayload>(token)?.isInvestor ?? false) : false;
}

/**
 * Mismo patrón que `useIsSuperAdmin` (lazy initializer, sin efecto) — decide
 * qué dashboard mostrar (`app/(main)/dashboard`, ver `docs/dashboard/
 * dashboard.md`). Mutuamente excluyente con `isSuperAdmin`: todo usuario
 * tiene exactamente un `UserType`.
 */
export function useIsInvestor(): boolean {
  const [isInvestor] = useState(readIsInvestor);
  return isInvestor;
}
