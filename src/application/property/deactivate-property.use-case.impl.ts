import type { DeactivatePropertyUseCase } from '@/domain/property/deactivate-property.use-case';
import type { PropertyRepository } from '@/domain/property/property.repository';

export class DeactivatePropertyUseCaseImpl implements DeactivatePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<void> {
    await this.propertyRepository.deactivate(id);
  }
}
