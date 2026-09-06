/** Saldo actual de una inversión (última fila del kardex, no un cálculo
 * propio — ver `docs/dashboard/dashboard.md` del backend). */
export interface InvestorInvestmentSummary {
  investmentId: string;
  propertyName: string;
  gestion: number;
  description: string;
  currentBalanceQuantity: number;
  currentBalanceKilos: number;
}

/** Dashboard de un usuario tipo Inversionista. `totalSalesReceived` es el
 * único número de dinero con significado bien definido hoy — no es
 * "ganancia" ni "capital invertido" (esos cálculos no existen todavía, ver
 * `docs/investment/investment.md` del backend). */
export interface InvestorDashboardSummary {
  investmentsCount: number;
  totalSalesReceived: number;
  investments: InvestorInvestmentSummary[];
}

export interface TopInvestorSummary {
  userId: string;
  fullName: string;
  totalSalesReceived: number;
}

export interface RecentMovementSummary {
  id: string;
  entryDate: string;
  detail: string;
  movementType: string;
  total: number;
  propertyName: string;
  investmentDescription: string;
}

/** Dashboard de Administrador/Super Administrador, acotado a la empresa
 * activa (mismo criterio que el resto de la app). */
export interface AdminDashboardSummary {
  propertiesCount: number;
  activeInvestmentsCount: number;
  investorsCount: number;
  totalSalesAmount: number;
  topInvestors: TopInvestorSummary[];
  recentMovements: RecentMovementSummary[];
}
