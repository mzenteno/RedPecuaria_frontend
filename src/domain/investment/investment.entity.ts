export interface Investment {
  id: string;
  propertyId: string;
  /** Resuelto con JOIN en el backend, no cruzado a mano contra el catálogo
   * de propiedades (bug real, ver `docs/investment/changes/...`). */
  propertyName: string;
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
  createdAt: string;
  investorIds: string[];
}

/** Forma liviana de los listados (`GET /investments`, `/by-gestion`,
 * `/by-property`, `/by-investor`, `/mine`) — a propósito SIN
 * `balanceQuantity`/`balanceKilos`/`total`: la grilla de Inversiones
 * (`investment-table.tsx`) no los muestra. Quien necesite el saldo (el
 * diálogo de edición, o "Saldo actual" en Kardex) pide el detalle completo
 * con `GET /investments/:id` (ver `useInvestmentById`), no lo cruza del
 * listado — mismo criterio que `UserListItem`/`GET /users/:id`. */
export interface InvestmentListItem {
  id: string;
  propertyId: string;
  /** Resuelto con JOIN en el backend, no cruzado a mano contra el catálogo
   * de propiedades (bug real, ver `docs/investment/changes/...`) —
   * `propertyId` se mantiene porque el atajo "Ver kardex" sí lo necesita
   * crudo (ver `buildKardexShortcutQuery` en `investments/page.tsx`). */
  propertyName: string;
  gestion: number;
  description: string;
  isFinished: boolean;
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
