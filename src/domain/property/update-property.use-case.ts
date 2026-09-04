import type { Property, UpdatePropertyData } from './property.entity';

export interface UpdatePropertyUseCase {
  execute(id: string, data: UpdatePropertyData): Promise<Property>;
}
