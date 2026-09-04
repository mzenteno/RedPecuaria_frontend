import type { Property, CreatePropertyData } from './property.entity';

export interface CreatePropertyUseCase {
  execute(data: CreatePropertyData): Promise<Property>;
}
