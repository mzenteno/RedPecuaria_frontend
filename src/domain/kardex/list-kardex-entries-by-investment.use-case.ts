import type { KardexEntriesPage } from './kardex-entry.repository';

export interface ListKardexEntriesParams {
  investmentId: string;
  /** El Kardex siempre se pide acotado a un inversionista puntual (a pedido
   * del usuario, 2026-10-14) — ver `(main)/kardex/page.tsx`. */
  investorUserId: string;
  page: number;
  pageSize: number;
  search?: string;
}

export interface ListKardexEntriesByInvestmentUseCase {
  execute(params: ListKardexEntriesParams): Promise<KardexEntriesPage>;
}
