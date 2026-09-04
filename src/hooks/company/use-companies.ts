'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCompaniesUseCase,
  createCompanyUseCase,
  updateCompanyUseCase,
  deactivateCompanyUseCase,
} from '@/infrastructure/di/company.container';
import type { CreateCompanyData, UpdateCompanyData } from '@/domain/company/company.entity';

const COMPANIES_KEY = ['companies'];

/**
 * Sin paginación a propósito: "empresas" son inquilinos del sistema, se
 * espera un puñado por mucho tiempo (a diferencia de "usuarios", que sí está
 * paginado) — ver docs/company/company.md.
 */
export function useCompanies() {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: () => listCompaniesUseCase.execute(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: COMPANIES_KEY });

  const { mutateAsync: createCompany } = useMutation({
    mutationFn: (data: CreateCompanyData) => createCompanyUseCase.execute(data),
    onSuccess: invalidate,
  });

  const { mutateAsync: updateCompanyMutation } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      updateCompanyUseCase.execute(id, data),
    onSuccess: invalidate,
  });

  const { mutateAsync: deactivateCompany } = useMutation({
    mutationFn: (id: string) => deactivateCompanyUseCase.execute(id),
    onSuccess: invalidate,
  });

  return {
    companies,
    isLoading,
    createCompany,
    updateCompany: (id: string, data: UpdateCompanyData) => updateCompanyMutation({ id, data }),
    deactivateCompany,
  };
}
