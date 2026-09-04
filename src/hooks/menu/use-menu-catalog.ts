'use client';

import { useQuery } from '@tanstack/react-query';
import { listMenuCatalogUseCase } from '@/infrastructure/di/menu.container';

export function useMenuCatalog() {
  return useQuery({
    queryKey: ['menu-catalog'],
    queryFn: () => listMenuCatalogUseCase.execute(),
    staleTime: 60_000,
  });
}
