import type { ListMovementTypesUseCase } from '@/domain/movement-type/list-movement-types.use-case';
import type { MovementTypeRepository } from '@/domain/movement-type/movement-type.repository';
import type { MovementType } from '@/domain/movement-type/movement-type.entity';

export class ListMovementTypesUseCaseImpl implements ListMovementTypesUseCase {
  constructor(private readonly movementTypeRepository: MovementTypeRepository) {}

  async execute(): Promise<MovementType[]> {
    return this.movementTypeRepository.list();
  }
}
