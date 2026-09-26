import type { PaginatedResult, PaginationParams } from '@/domain/common/paginated-result';
import type { Investment, InvestmentListItem, CreateInvestmentData, UpdateInvestmentData } from './investment.entity';

export interface ListInvestmentsByGestionParams {
  gestion: number;
  page: number;
  pageSize: number;
  propertyId?: string;
  investorUserId?: string;
  search?: string;
}

export interface ListInvestmentsByPropertyPaginatedParams {
  propertyId: string;
  page: number;
  pageSize: number;
  gestion?: number;
  investorUserId?: string;
  search?: string;
}

export interface ListInvestmentsByInvestorParams {
  investorUserId: string;
  page: number;
  pageSize: number;
  propertyId?: string;
  search?: string;
}

/** `companyId` nunca aparece: siempre la empresa activa. `propertyId` sí es
 * explícito — una empresa tiene varias propiedades, no hay una "propiedad
 * activa" de la sesión.
 *
 * Sin capa de "casos de uso" separada (a diferencia del backend): acá cada
 * método de este repositorio YA ES la operación completa que un hook
 * necesita — no hay ninguna orquestación de por medio (eso vive del lado
 * del backend, ver `InvestmentWithInvestors` en
 * `list-investments-by-property-paginated.use-case.ts`). Meter un caso de
 * uso que solo hiciera `return this.investmentRepository.xxx(params)` sería
 * una capa sin ningún propósito real — ver `docs/investment/changes/...`
 * (arquitectura del frontend). El día que un hook necesite combinar más de
 * una llamada o aplicar una regla propia del cliente, ESE es el momento de
 * agregar un archivo de caso de uso acá, no antes. */
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
