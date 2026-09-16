import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { Property, PropertyOption, CreatePropertyData, UpdatePropertyData } from './property.entity';

/** Sin `companyId` en ningún método: siempre la empresa activa de la
 * sesión, igual criterio que `RoleRepository`. */
export interface PropertyRepository {
  list(params: PaginationParams): Promise<PaginatedResult<Property>>;
  /** `GET /properties/options` — liviano y sin paginar, para combos (ver
   * `PropertyOption`). */
  listOptions(): Promise<PropertyOption[]>;
  create(data: CreatePropertyData): Promise<Property>;
  update(id: string, data: UpdatePropertyData): Promise<Property>;
  deactivate(id: string): Promise<void>;
}
