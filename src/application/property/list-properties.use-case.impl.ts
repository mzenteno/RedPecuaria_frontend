import type { ListPropertiesUseCase } from '@/domain/property/list-properties.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property } from '@/domain/property/property.entity';

export class ListPropertiesUseCaseImpl implements ListPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(): Promise<Property[]> {
    return this.propertyRepository.list();
  }
}
