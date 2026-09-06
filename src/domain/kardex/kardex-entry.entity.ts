/**
 * "ingreso": carga general de ganado a la inversión, sin inversionista
 * particular. "venta": movimiento de salida atribuido a un inversionista
 * puntual. "baja": pérdida/muerte, general como el ingreso, sin
 * inversionista. Catálogo fijo, igual criterio que el backend (ver
 * docs/investment/investment.md, no es administrable).
 */
export type KardexMovementType = 'ingreso' | 'venta' | 'baja';

export const KARDEX_MOVEMENT_TYPE_OPTIONS: { value: KardexMovementType; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'venta', label: 'Venta' },
  { value: 'baja', label: 'Baja' },
];

export interface KardexEntry {
  id: string;
  investmentId: string;
  entryDate: string;
  detail: string;
  movementType: KardexMovementType;
  /** Solo presente si `movementType === 'venta'`. */
  investorUserId: string | null;
  avgWeight: number;
  entryQuantity: number;
  entryKilos: number;
  exitQuantity: number;
  exitKilos: number;
  balanceQuantity: number;
  balanceKilos: number;
  total: number;
  isDeleted: boolean;
  createdAt: string;
}

export type KardexEntryFields = Omit<KardexEntry, 'id' | 'investmentId' | 'isDeleted' | 'createdAt'>;

export interface CreateKardexEntryData extends KardexEntryFields {
  investmentId: string;
}

export type UpdateKardexEntryData = KardexEntryFields;
