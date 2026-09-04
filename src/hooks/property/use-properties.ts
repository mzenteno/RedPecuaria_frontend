'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPropertiesUseCase,
  createPropertyUseCase,
  updatePropertyUseCase,
  deactivatePropertyUseCase,
} from '@/infrastructure/di/property.container';
import type { CreatePropertyData, UpdatePropertyData } from '@/domain/property/property.entity';

const PROPERTIES_KEY = ['properties'];

/** Sin paginación de servidor, mismo criterio que `useCompanies`/`useRoles`
 * — un puñado de fincas por empresa, no miles. */
export function useProperties() {
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: PROPERTIES_KEY,
    queryFn: () => listPropertiesUseCase.execute(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY });

  const { mutateAsync: createProperty } = useMutation({
    mutationFn: (data: CreatePropertyData) => createPropertyUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updatePropertyMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyData }) => updatePropertyUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateProperty } = useMutation({
    mutationFn: (id: string) => deactivatePropertyUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    properties,
    isLoading,
    createProperty,
    updateProperty: (id: string, data: UpdatePropertyData) => updatePropertyMutation({ id, data }),
    deactivateProperty,
  };
}
