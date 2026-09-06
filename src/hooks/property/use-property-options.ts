'use client';

import { useQuery } from '@tanstack/react-query';
import { listPropertiesUseCase } from '@/infrastructure/di/property.container';

// Sin paginación real acá a propósito (fase 1, mismo criterio que
// `useInvestorUsers`): trae hasta 100 propiedades de la empresa activa —
// si una empresa llega a tener más, hay que pasar esto a un combo con
// búsqueda real de servidor, no está hecho todavía.
const PAGE_SIZE = 100;

/** Todas las propiedades de la empresa activa (hasta 100), para un combo o
 * para resolver un nombre a partir de un `propertyId` — a diferencia de
 * `useProperties`, que pagina de verdad para la pantalla de Propiedades en
 * sí. Usado por Inversiones (combo "Propiedad") y Kardex (nombre de la
 * propiedad de cada inversión). */
export function usePropertyOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['property-options'],
    queryFn: () => listPropertiesUseCase.execute({ page: 1, pageSize: PAGE_SIZE }),
  });

  return { properties: data?.items ?? [], isLoading };
}
