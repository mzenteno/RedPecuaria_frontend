import type { ListPropertiesUseCase } from '@/domain/property/list-properties.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { Property } from '@/domain/property/property.entity';

export class ListPropertiesUseCaseImpl implements ListPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Property>> {
    return this.propertyRepository.list(params);
  }
}
