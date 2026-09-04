import type { UpdatePropertyUseCase } from '@/domain/property/update-property.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';
import type { Property, UpdatePropertyData } from '@/domain/property/property.entity';

export class UpdatePropertyUseCaseImpl implements UpdatePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string, data: UpdatePropertyData): Promise<Property> {
    return this.propertyRepository.update(id, data);
  }
}
