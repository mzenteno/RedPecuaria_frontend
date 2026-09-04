import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property, CreatePropertyData, UpdatePropertyData } from '@/domain/property/property.entity';
import { httpClient } from '../../http/http-client';

export class PropertyRepositoryImpl implements PropertyRepository {
  async list(): Promise<Property[]> {
    return httpClient.get<Property[]>('/properties');
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
