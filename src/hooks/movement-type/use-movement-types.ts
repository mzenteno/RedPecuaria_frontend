'use client';

import { useQuery } from '@tanstack/react-query';
import { listMovementTypesUseCase } from '@/infrastructure/di/movement-type.container';

export function useMovementTypes() {
  return useQuery({
    queryKey: ['movement-types'],
    queryFn: () => listMovementTypesUseCase.execute(),
    staleTime: 60_000,
  });
}
