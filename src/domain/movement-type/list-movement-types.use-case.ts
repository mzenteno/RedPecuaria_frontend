import type { MovementType } from './movement-type.entity';

export interface ListMovementTypesUseCase {
  execute(): Promise<MovementType[]>;
}
