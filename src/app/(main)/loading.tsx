import { Spinner } from '@/components/ui/spinner';

/**
 * Se muestra durante la navegación a cualquier ruta dentro de (main) mientras
 * el segmento se resuelve. No cubre el fetch de datos del lado del cliente
 * (React Query) — eso lo maneja cada componente con su propio estado de
 * loading — pero sí evita una pantalla en blanco en la transición de ruta.
 */
export default function MainLoading() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <div style={{ color: 'var(--primary)' }}>
        <Spinner className="h-8 w-8" />
      </div>
    </div>
  );
}
