'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { usePermission } from '@/hooks/menu/use-permission';
import { RequirePermission } from '@/components/auth/require-permission';

const MENU_KEY = 'properties';
export const PROPERTIES_PATH = '/properties';

interface PropertyFormScreenProps {
  title: string;
  subtitle: string;
  /** `canCreate` para el alta, `canEdit` para la edición — `RequirePermission`
   * solo mira `canView`, y alguien con solo lectura no debería poder entrar
   * escribiendo la URL a mano. */
  requires: 'create' | 'edit';
  children: ReactNode;
}

/** Marco común de `/properties/new` y `/properties/[id]`: permisos, "Volver
 * a Propiedades" y título. */
export function PropertyFormScreen(props: PropertyFormScreenProps) {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <PropertyFormScreenContent {...props} />
    </RequirePermission>
  );
}

function PropertyFormScreenContent({ title, subtitle, requires, children }: PropertyFormScreenProps) {
  const router = useRouter();
  const { canCreate, canEdit, isLoading } = usePermission(MENU_KEY);
  const allowed = requires === 'create' ? canCreate : canEdit;

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(PROPERTIES_PATH);
    }
  }, [isLoading, allowed, router]);

  if (isLoading || !allowed) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push(PROPERTIES_PATH)}
        className="tipo-link mb-4 flex cursor-pointer items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Volver a Propiedades
      </button>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="tipo-titulo-card">{title}</h1>
        <p className="tipo-secundario">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
