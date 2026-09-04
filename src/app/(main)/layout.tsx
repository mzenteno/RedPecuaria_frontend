'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/shell';
import { getAccessToken } from '@/infrastructure/http/session-storage';

/**
 * Guard de rutas del lado del cliente — no es tan fuerte como un middleware
 * de Next.js con cookies httpOnly (ver ARCHITECTURE.md §4 de este frontend
 * para el detalle y la limitación conocida), pero sí redirige de verdad si
 * no hay sesión, a diferencia de no tener ningún guard.
 *
 * `hasToken` arranca en `null` ("todavía no se sabe") tanto en el render del
 * servidor como en el primer render del cliente — Next SÍ renderiza una vez
 * en el servidor los Client Components para el HTML inicial, así que leer
 * `localStorage` directo en el inicializador de `useState` (como se hacía
 * antes) hace que el servidor vea "sin sesión" y el cliente "con sesión" en
 * ese primer render, y React tira un error de hidratación (mismatch) — el
 * chequeo real de `localStorage` tiene que vivir en un efecto (client-only,
 * corre después de la hidratación), nunca en el render.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken() !== null;
    if (!token) {
      router.replace('/login');
    }
    // Excepción deliberada a la regla: acá SÍ hace falta el efecto (no un
    // inicializador perezoso) — es lo que evita el mismatch de hidratación
    // explicado arriba. `localStorage` es exactamente el "sistema externo"
    // que la regla espera que se sincronice desde un efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasToken(token);
  }, [router]);

  // `null` (todavía verificando) o `false` (redirigiendo): no mostrar nada.
  if (!hasToken) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
