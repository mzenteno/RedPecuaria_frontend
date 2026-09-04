import type { Investment, CreateInvestmentData, UpdateInvestmentData } from './investment.entity';

/** `companyId` nunca aparece: siempre la empresa activa. `propertyId` sí es
 * explícito — una empresa tiene varias propiedades, no hay una "propiedad
 * activa" de la sesión. */
export interface InvestmentRepository {
  listByProperty(propertyId: string): Promise<Investment[]>;
  create(data: CreateInvestmentData): Promise<Investment>;
  update(id: string, data: UpdateInvestmentData): Promise<Investment>;
  deactivate(id: string): Promise<void>;
}
