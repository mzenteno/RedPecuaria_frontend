export interface Investment {
  id: string;
  propertyId: string;
  gestion: number;
  description: string;
  /** Saldo vigente — ya no vive por fila en el kardex, se mantiene acá y se
   * actualiza en cada alta/edición/baja de un `KardexEntry` (ver
   * docs/investment/investment.md del backend). */
  balanceQuantity: number;
  balanceKilos: number;
  total: number;
  /** Estado de negocio (activa/terminada), elegido a mano por el usuario —
   * distinto de `isDeleted` (baja administrativa). La idea es marcarla
   * como terminada cuando el saldo llegue a 0, pero no se fuerza. */
  isFinished: boolean;
  isDeleted: boolean;
  createdAt: string;
  investorIds: string[];
}

export interface CreateInvestmentData {
  propertyId: string;
  gestion: number;
  description: string;
  investorUserIds: string[];
}

export interface UpdateInvestmentData {
  propertyId: string;
  gestion: number;
  description: string;
  investorUserIds: string[];
  isFinished: boolean;
}
