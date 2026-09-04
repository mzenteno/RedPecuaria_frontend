import type { Property } from './property.entity';

export interface ListPropertiesUseCase {
  execute(): Promise<Property[]>;
}
