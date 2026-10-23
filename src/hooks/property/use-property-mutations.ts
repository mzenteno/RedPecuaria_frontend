'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPropertyUseCase, updatePropertyUseCase } from '@/infrastructure/di/property.container';
import type { CreatePropertyData, UpdatePropertyData } from '@/domain/property/property.entity';

/** Alta/edición de una propiedad — aparte de `useProperties` porque las
 * pantallas `/properties/new` y `/properties/[id]` no muestran el listado
 * (no tiene sentido que disparen su `GET /properties` paginado). Invalida
 * el listado, las opciones de los combos y el detalle. */
export function usePropertyMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['property'] });
    queryClient.invalidateQueries({ queryKey: ['property-options'] });
  };

  const { mutateAsync: createProperty } = useMutation({
    mutationFn: (data: CreatePropertyData) => createPropertyUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updatePropertyMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyData }) => updatePropertyUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  return {
    createProperty,
    updateProperty: (id: string, data: UpdatePropertyData) => updatePropertyMutation({ id, data }),
  };
}
