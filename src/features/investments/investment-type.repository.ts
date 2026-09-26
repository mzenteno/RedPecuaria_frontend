import type { InvestmentType } from './investment-type.entity';

export interface InvestmentTypeRepository {
  /** `GET /investment-types` — catálogo cerrado, sembrado por migración,
   * sin CRUD propio (ver docs/investment/investment.md del backend). */
  list(): Promise<InvestmentType[]>;
}
