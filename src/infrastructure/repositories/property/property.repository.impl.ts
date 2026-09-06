import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property, CreatePropertyData, UpdatePropertyData } from '@/domain/property/property.entity';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import { httpClient } from '../../http/http-client';

function buildQuery(params: PaginationParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search) {
    query.set('search', params.search);
  }
  return query.toString();
}

export class PropertyRepositoryImpl implements PropertyRepository {
  async list(params: PaginationParams): Promise<PaginatedResult<Property>> {
    const result = await httpClient.getPaginated<Property>(`/properties?${buildQuery(params)}`);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async create(data: CreatePropertyData): Promise<Property> {
    return httpClient.post<Property>('/properties', data);
  }

  async update(id: string, data: UpdatePropertyData): Promise<Property> {
    return httpClient.patch<Property>(`/properties/${id}`, data);
  }

  async deactivate(id: string): Promise<void> {
    await httpClient.patch<void>(`/properties/${id}/deactivate`);
  }
}
