import type { CreatePropertyUseCase } from '@/domain/property/create-property.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property, CreatePropertyData } from '@/domain/property/property.entity';

export class CreatePropertyUseCaseImpl implements CreatePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(data: CreatePropertyData): Promise<Property> {
    return this.propertyRepository.create(data);
  }
}
