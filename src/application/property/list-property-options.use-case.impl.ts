import type { ListPropertyOptionsUseCase } from '@/domain/property/list-property-options.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { PropertyOption } from '@/domain/property/property.entity';

export class ListPropertyOptionsUseCaseImpl implements ListPropertyOptionsUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(): Promise<PropertyOption[]> {
    return this.propertyRepository.listOptions();
  }
}
