import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { ListInvestmentsByGestionParams } from './list-investments-by-gestion.use-case';
import type { ListInvestmentsByPropertyPaginatedParams } from './list-investments-by-property-paginated.use-case';
import type { ListInvestmentsByInvestorParams } from './list-investments-by-investor.use-case';
import type { Investment, InvestmentListItem, CreateInvestmentData, UpdateInvestmentData } from './investment.entity';

/** `companyId` nunca aparece: siempre la empresa activa. `propertyId` sí es
 * explícito — una empresa tiene varias propiedades, no hay una "propiedad
 * activa" de la sesión. */
export interface InvestmentRepository {
  /** De cualquier propiedad de la empresa activa, para una gestión puntual
   * — la pantalla de Inversiones elige "Gestión" primero, "Propiedad"/
   * "Inversionista" son filtros opcionales adicionales, paginado en el
   * servidor. */
  listByGestion(params: ListInvestmentsByGestionParams): Promise<PaginatedResult<InvestmentListItem>>;
  /** "Propiedad" también puede disparar la consulta por sí sola (sin
   * "Gestión" ni "Inversionista" elegidos), paginado — mismo criterio que
   * `listByGestion`/`listByInvestor`. */
  listByPropertyPaginated(
    params: ListInvestmentsByPropertyPaginatedParams,
  ): Promise<PaginatedResult<InvestmentListItem>>;
  /** De cualquier gestión y cualquier propiedad, para un inversionista
   * puntual — buscar "todas las inversiones de tal inversionista" desde
   * la pantalla de Inversiones (a diferencia de `listMine`, acá el
   * inversionista es explícito, elegido en un combo). Paginado. */
  listByInvestor(params: ListInvestmentsByInvestorParams): Promise<PaginatedResult<InvestmentListItem>>;
  /** "Mis inversiones" — las del usuario logueado como inversionista, sin
   * importar de qué propiedad sean. `userId` nunca se manda: sale de la
   * sesión en el backend (`@CurrentUser('sub')`). Paginado. */
  listMine(params: PaginationParams): Promise<PaginatedResult<InvestmentListItem>>;
  /** `GET /investments/:id` — detalle completo (con saldo), para quien
   * necesite más que lo que traen los listados (a propósito livianos, ver
   * `InvestmentListItem`): el diálogo de edición y "Saldo actual" en
   * Kardex. */
  getById(id: string): Promise<Investment>;
  create(data: CreateInvestmentData): Promise<Investment>;
  update(id: string, data: UpdateInvestmentData): Promise<Investment>;
  deactivate(id: string): Promise<void>;
}
