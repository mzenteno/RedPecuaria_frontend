'use client';

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPropertiesUseCase,
  createPropertyUseCase,
  updatePropertyUseCase,
  deactivatePropertyUseCase,
} from '@/infrastructure/di/property.container';
import type { CreatePropertyData, UpdatePropertyData } from '@/domain/property/property.entity';

const PROPERTIES_KEY = 'properties';

/** Paginación real de servidor (`GET /properties?page=&pageSize=&search=`),
 * mismo patrón que `useUsers` — ver ARCHITECTURE.md §8/§9: todo listado
 * pagina en el servidor salvo Empresas/Roles/Permisos. Para "necesito todas
 * las propiedades para un combo" (Inversiones, Kardex), no este hook — ver
 * `usePropertyOptions`. */
export function useProperties(page: number, pageSize: number, search: string) {
  const queryClient = useQueryClient();
  const queryKey = [PROPERTIES_KEY, page, pageSize, search];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listPropertiesUseCase.execute({ page, pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PROPERTIES_KEY] });

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
    properties: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    isLoading,
    createProperty,
    updateProperty: (id: string, data: UpdatePropertyData) => updatePropertyMutation({ id, data }),
    deactivateProperty,
  };
}
