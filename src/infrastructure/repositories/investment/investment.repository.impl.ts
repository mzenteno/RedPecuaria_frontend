import type { InvestmentRepository } from '@/domain/investment/investment.repository';
import type { Investment, InvestmentListItem, CreateInvestmentData, UpdateInvestmentData } from '@/domain/investment/investment.entity';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { ListInvestmentsByGestionParams } from '@/domain/investment/list-investments-by-gestion.use-case';
import type { ListInvestmentsByPropertyPaginatedParams } from '@/domain/investment/list-investments-by-property-paginated.use-case';
import type { ListInvestmentsByInvestorParams } from '@/domain/investment/list-investments-by-investor.use-case';
import { httpClient } from '../../http/http-client';

function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

export class InvestmentRepositoryImpl implements InvestmentRepository {
  async listMine(params: PaginationParams): Promise<PaginatedResult<InvestmentListItem>> {
    const query = toQueryString({ page: params.page, pageSize: params.pageSize });
    const result = await httpClient.getPaginated<InvestmentListItem>(`/investments/mine?${query}`);
    return { items: result.items, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  async listByGestion(params: ListInvestmentsByGestionParams): Promise<PaginatedResult<InvestmentListItem>> {
    const query = toQueryString({
      gestion: params.gestion,
      page: params.page,
      pageSize: params.pageSize,
      propertyId: params.propertyId,
      investorUserId: params.investorUserId,
      search: params.search,
    });
    const result = await httpClient.getPaginated<InvestmentListItem>(`/investments/by-gestion?${query}`);
    return { items: result.items, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  async listByPropertyPaginated(
    params: ListInvestmentsByPropertyPaginatedParams,
  ): Promise<PaginatedResult<InvestmentListItem>> {
    const query = toQueryString({
      propertyId: params.propertyId,
      page: params.page,
      pageSize: params.pageSize,
      gestion: params.gestion,
      investorUserId: params.investorUserId,
      search: params.search,
    });
    const result = await httpClient.getPaginated<InvestmentListItem>(`/investments/by-property?${query}`);
    return { items: result.items, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  async listByInvestor(params: ListInvestmentsByInvestorParams): Promise<PaginatedResult<InvestmentListItem>> {
    const query = toQueryString({
      investorUserId: params.investorUserId,
      page: params.page,
      pageSize: params.pageSize,
      propertyId: params.propertyId,
      search: params.search,
    });
    const result = await httpClient.getPaginated<InvestmentListItem>(`/investments/by-investor?${query}`);
    return { items: result.items, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  async getById(id: string): Promise<Investment> {
    return httpClient.get<Investment>(`/investments/${id}`);
  }

  async create(data: CreateInvestmentData): Promise<Investment> {
    return httpClient.post<Investment>('/investments', data);
  }

  async update(id: string, data: UpdateInvestmentData): Promise<Investment> {
    return httpClient.patch<Investment>(`/investments/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/investments/${id}/deactivate`);
  }
}
