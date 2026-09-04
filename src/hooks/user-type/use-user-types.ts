'use client';

import { useQuery } from '@tanstack/react-query';
import { listUserTypesUseCase } from '@/infrastructure/di/user-type.container';

export function useUserTypes() {
  return useQuery({
    queryKey: ['user-types'],
    queryFn: () => listUserTypesUseCase.execute(),
    staleTime: 60_000,
  });
}
