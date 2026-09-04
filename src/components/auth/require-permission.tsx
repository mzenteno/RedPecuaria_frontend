'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/menu/use-permission';

interface RequirePermissionProps {
  menuKey: string;
  children: ReactNode;
}

/**
 * Bloquea el contenido de una pantalla completa si el rol actual no tiene
 * `canView` sobre ese menú (Super Administrador siempre pasa, vía el
 * override de `usePermission`) y redirige a `/dashboard`.
 *
 * Solo evita que alguien sin permiso llegue a la pantalla escribiendo la URL
 * a mano — no es control de acceso real, el backend no lo valida todavía
 * (ver ARCHITECTURE.md).
 */
export function RequirePermission({ menuKey, children }: RequirePermissionProps) {
  const router = useRouter();
  const { canView, isLoading } = usePermission(menuKey);

  useEffect(() => {
    if (!isLoading && !canView) {
      router.replace('/dashboard');
    }
  }, [isLoading, canView, router]);

  if (isLoading || !canView) {
    return null;
  }

  return <>{children}</>;
}
