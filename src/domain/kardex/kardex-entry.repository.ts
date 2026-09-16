import type { PaginatedResult } from '@/domain/common/paginated-result';
import type { ListKardexEntriesParams } from './list-kardex-entries-by-investment.use-case';
import type {
  KardexEntry,
  KardexEntryListItem,
  CreateKardexEntryData,
  UpdateKardexEntryData,
} from './kardex-entry.entity';

/** El listado paginado de siempre más los totales de Debe/Haber de TODO el
 * historial activo de la inversión (no solo la página) — para el footer de
 * la tabla. No se agranda `PaginatedResult<T>` con esto: es compartido por
 * cualquier listado paginado de la app, que no necesita estos 2 campos.
 * Espejo de `KardexEntriesPage` del backend. */
export interface KardexEntriesPage extends PaginatedResult<KardexEntryListItem> {
  totalDebe: number;
  totalHaber: number;
}

export interface KardexEntryRepository {
  listByInvestment(params: ListKardexEntriesParams): Promise<KardexEntriesPage>;
  /** `GET /kardex-entries/:id` — detalle completo (con `total`), para quien
   * necesite más que lo que trae `listByInvestment` (a propósito liviano,
   * ver `KardexEntryListItem`): el diálogo de edición. */
  getById(id: string): Promise<KardexEntry>;
  create(data: CreateKardexEntryData): Promise<KardexEntry>;
  update(id: string, data: UpdateKardexEntryData): Promise<KardexEntry>;
  deactivate(id: string): Promise<void>;
}
