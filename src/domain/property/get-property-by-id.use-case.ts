import type { Property } from './property.entity';

export interface GetPropertyByIdUseCase {
  execute(id: string): Promise<Property>;
}
