'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary raíz del App Router — captura cualquier error no manejado
 * en un Server o Client Component debajo de este nivel. Debe ser Client
 * Component (requisito de Next.js) y no puede incluir <html>/<body> (eso es
 * solo para global-error.tsx, que captura errores del propio layout raíz).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: enviar a un servicio de error tracking cuando el proyecto tenga uno.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="tipo-titulo-card">Algo salió mal</p>
      <p className="tipo-secundario">Ocurrió un error inesperado. Podés intentar de nuevo.</p>
      <Button onClick={reset} className="w-auto px-6">
        Reintentar
      </Button>
    </div>
  );
}
