'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/company/use-companies';
import { useIsSuperAdmin } from '@/hooks/menu/use-is-super-admin';
import { useSwitchCompany } from '@/hooks/auth/use-switch-company';
import { getCompanyId } from '@/infrastructure/http/session-storage';

/**
 * "Empresa activa" de la sesión — fuera de cualquier pantalla de CRUD a
 * propósito (vive en el `TopBar`, se ve en toda la app) porque no es un dato
 * de una pantalla puntual: todo lo que un Super Administrador cree/edite de
 * ahí en más (Usuarios, Roles, ...) se aplica sobre esta empresa.
 *
 * Solo visible para Super Administrador — el resto de los usuarios tiene una
 * sola empresa fija para toda la sesión (la elegida al loguearse), no hay
 * nada que cambiar. Ver `docs/auth-sessions/auth-sessions.md`.
 */
export function CompanySwitcher() {
  const isSuperAdmin = useIsSuperAdmin();
  const { companies } = useCompanies();
  const { switchCompany, loading } = useSwitchCompany();
  const [activeCompanyId, setActiveCompanyId] = useState(getCompanyId);

  if (!isSuperAdmin) {
    return null;
  }

  async function handleChange(companyId: string): Promise<void> {
    const session = await switchCompany(companyId);
    if (session) {
      setActiveCompanyId(session.companyId);
    }
  }

  return (
    <div className="min-w-0 max-w-[7.5rem] sm:max-w-[10rem] md:max-w-[14rem] ml-2">
      <select
        aria-label="Empresa activa"
        value={activeCompanyId ?? ''}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full truncate border px-2.5 py-1.5 text-sm outline-none bg-transparent cursor-pointer disabled:cursor-wait disabled:opacity-60"
        style={{ borderColor: 'var(--border-input)' }}
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  );
}
