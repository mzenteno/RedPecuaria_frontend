'use client';

import { useQuery } from '@tanstack/react-query';
import { listPropertyOptionsUseCase } from '@/infrastructure/di/property.container';

/** Todas las propiedades de la empresa activa (`id`+`name`, sin paginar),
 * para un combo o para resolver un nombre a partir de un `propertyId` — a
 * diferencia de `useProperties`, que pagina de verdad para la pantalla de
 * Propiedades en sí. Usado por Inversiones (combo "Propiedad") y Kardex
 * (nombre de la propiedad de cada inversión).
 *
 * `GET /properties/options` — endpoint propio, liviano (no reusa el
 * paginado de la grilla CRUD): antes esto pedía `GET /properties` con
 * `pageSize=100` (el tope del endpoint paginado) como forma de "traer
 * todo de una", lo que se rompía silenciosamente si una empresa pasaba de
 * 100 propiedades (ver `docs/property/changes/...`). */
export function usePropertyOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['property-options'],
    queryFn: () => listPropertyOptionsUseCase.execute(),
  });

  return { properties: data ?? [], isLoading };
}
