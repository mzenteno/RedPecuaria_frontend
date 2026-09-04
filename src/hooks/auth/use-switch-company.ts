'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { switchCompanyUseCase } from '@/infrastructure/di/auth.container';
import { saveSession } from '@/infrastructure/http/session-storage';
import { ApiError } from '@/infrastructure/http/http-client';
import type { AuthSession } from '@/domain/auth/auth.entity';

/**
 * Cambia la "empresa activa" de la sesión sin loguearse de nuevo — solo
 * válido para un Super Administrador (`POST /auth/switch-company`, el
 * backend rechaza a cualquier otro con `SuperAdminRequiredException`).
 * Invalida todo el cache de React Query: cualquier listado/menú ya cargado
 * pertenece a la empresa anterior.
 */
export function useSwitchCompany() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function switchCompany(companyId: string): Promise<AuthSession | null> {
    setLoading(true);
    setError(null);
    try {
      const session = await switchCompanyUseCase.execute(companyId);
      saveSession(session);
      await queryClient.invalidateQueries();
      return session;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar de empresa');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { switchCompany, loading, error };
}
