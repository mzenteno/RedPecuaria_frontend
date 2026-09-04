'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUseCase } from '@/infrastructure/di/auth.container';
import { saveSession } from '@/infrastructure/http/session-storage';
import { ApiError } from '@/infrastructure/http/http-client';
import type { CompanyChoice, LoginCredentials } from '@/domain/auth/auth.entity';

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyChoices, setCompanyChoices] = useState<CompanyChoice[] | null>(null);
  // Guarda usuario/contraseña mientras se espera que el usuario elija empresa,
  // para poder reintentar el login solo agregando el companyId elegido.
  const [pendingCredentials, setPendingCredentials] = useState<LoginCredentials | null>(null);

  async function login(credentials: LoginCredentials): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const session = await loginUseCase.execute(credentials);
      saveSession(session);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.errorName === 'CompanySelectionRequiredException') {
        setCompanyChoices((err.details?.choices as CompanyChoice[] | undefined) ?? []);
        setPendingCredentials(credentials);
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  async function selectCompany(companyId: string): Promise<void> {
    if (!pendingCredentials) return;
    setCompanyChoices(null);
    await login({ ...pendingCredentials, companyId });
  }

  function cancelCompanySelection(): void {
    setCompanyChoices(null);
    setPendingCredentials(null);
  }

  return { login, loading, error, companyChoices, selectCompany, cancelCompanySelection };
}
