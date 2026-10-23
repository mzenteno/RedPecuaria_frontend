import type { GetPropertyByIdUseCase } from '@/domain/property/get-property-by-id.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property } from '@/domain/property/property.entity';

export class GetPropertyByIdUseCaseImpl implements GetPropertyByIdUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<Property> {
    return this.propertyRepository.getById(id);
  }
}
