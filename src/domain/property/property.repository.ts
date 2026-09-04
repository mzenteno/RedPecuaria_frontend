import type { Property, CreatePropertyData, UpdatePropertyData } from './property.entity';

/** Sin `companyId` en ningún método: siempre la empresa activa de la
 * sesión, igual criterio que `RoleRepository`. */
export interface PropertyRepository {
  list(): Promise<Property[]>;
  create(data: CreatePropertyData): Promise<Property>;
  update(id: string, data: UpdatePropertyData): Promise<Property>;
  deactivate(id: string): Promise<void>;
}
