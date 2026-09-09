export interface KardexEntry {
  id: string;
  investmentId: string;
  entryDate: string;
  detail: string;
  /** FK a `MovementType` (ver `domain/movement-type/`) — ya no un string
   * literal, catálogo cerrado sembrado por migración en el backend. */
  movementTypeId: string;
  /** Solo presente si el tipo de movimiento es "venta". */
  investorUserId: string | null;
  avgWeight: number;
  entryQuantity: number;
  entryKilos: number;
  exitQuantity: number;
  exitKilos: number;
  /** Dato que tipea el usuario en Ingreso/Venta (0 en Baja) — el saldo
   * acumulado vive en `Investment.balanceQuantity`/`balanceKilos`/`total`,
   * no acá (ver `domain/investment/investment.entity.ts`). */
  total: number;
  isDeleted: boolean;
  createdAt: string;
}

/** Solo para el listado (`GET /kardex-entries`) — agrega el saldo corrido
 * (cantidad/kilos) después de este movimiento, calculado por el backend al
 * leer (función de ventana SQL sobre todo el historial de la inversión),
 * nunca guardado. Distinto del saldo VIGENTE de la inversión
 * (`Investment.balanceQuantity`/`balanceKilos`) — esto es el histórico fila
 * por fila, solo para mostrar. Crear/editar sigue trabajando con
 * `KardexEntry` a secas. */
export interface KardexEntryListItem extends KardexEntry {
  runningBalanceQuantity: number;
  runningBalanceKilos: number;
}

export type KardexEntryFields = Omit<KardexEntry, 'id' | 'investmentId' | 'isDeleted' | 'createdAt'>;

export interface CreateKardexEntryData extends KardexEntryFields {
  investmentId: string;
}

export type UpdateKardexEntryData = KardexEntryFields;
