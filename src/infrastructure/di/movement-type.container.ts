import { ListMovementTypesUseCaseImpl } from '@/application/movement-type/list-movement-types.use-case.impl';
import { MovementTypeRepositoryImpl } from '../repositories/movement-type/movement-type.repository.impl';

export const movementTypeRepository = new MovementTypeRepositoryImpl();
export const listMovementTypesUseCase = new ListMovementTypesUseCaseImpl(movementTypeRepository);
