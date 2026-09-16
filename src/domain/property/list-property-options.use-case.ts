import type { PropertyOption } from './property.entity';

export interface ListPropertyOptionsUseCase {
  execute(): Promise<PropertyOption[]>;
}
