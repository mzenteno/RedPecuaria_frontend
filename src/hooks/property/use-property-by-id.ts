'use client';

import { useQuery } from '@tanstack/react-query';
import { getPropertyByIdUseCase } from '@/infrastructure/di/property.container';

/** Detalle de una propiedad (`GET /properties/:id`) — para la pantalla de
 * edición (`/properties/[id]`), que al ser una ruta propia tiene que poder
 * cargarse sola (recarga, link directo), sin depender de la fila del
 * listado. Mismo patrón que `useInvestmentById`. */
export function usePropertyById(propertyId: string) {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyByIdUseCase.execute(propertyId),
  });
}
