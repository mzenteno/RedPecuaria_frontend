import type { MovementType } from './movement-type.entity';

export interface MovementTypeRepository {
  /** `GET /kardex-movement-types` — catálogo cerrado, sembrado por migración, sin CRUD propio
   * (ver docs/investment/investment.md del backend). */
  list(): Promise<MovementType[]>;
}
