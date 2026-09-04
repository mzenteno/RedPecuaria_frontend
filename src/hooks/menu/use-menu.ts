'use client';

import { useQuery } from '@tanstack/react-query';
import { getMenuUseCase } from '@/infrastructure/di/menu.container';
import { useIsSuperAdmin } from './use-is-super-admin';

export function useMenu() {
  const isSuperAdmin = useIsSuperAdmin();
  return useQuery({
    queryKey: ['authorized-menu', isSuperAdmin],
    queryFn: () => getMenuUseCase.execute(isSuperAdmin),
    staleTime: 60_000,
  });
}
