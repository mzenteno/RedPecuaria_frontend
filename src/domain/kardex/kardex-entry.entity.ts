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
   * no acá (ver `features/investments/investment.entity.ts`). */
  total: number;
  createdAt: string;
}

/** Forma liviana del listado (`GET /kardex-entries`) — a propósito NO
 * `extends KardexEntry`: la tabla de Kardex no muestra `total` (se sacó de
 * la pantalla, sigue solo en el diálogo de alta/edición), ni
 * `investmentId`/`createdAt` (el listado ya está acotado a una sola
 * inversión). Tampoco trae `movementTypeId`/`investorUserId` (los FK
 * crudos) — en su lugar, `movementTypeName`/`investorName` ya vienen
 * resueltos con JOIN desde el backend: no hay que pedir `GET
 * /kardex-movement-types` ni la lista de inversionistas aparte para
 * cruzarlos a mano solo para pintar esta tabla (bug real, ver
 * `docs/investment/changes/...`) — mismo criterio que `UserListItem`
 * (`userTypeName` en vez de `userTypeId`). Agrega también el saldo corrido
 * (cantidad/kilos) después de este movimiento, calculado por el backend al
 * leer (función de ventana SQL sobre todo el historial de la inversión),
 * nunca guardado — distinto del saldo VIGENTE de la inversión
 * (`Investment.balanceQuantity`/`balanceKilos`), que es el histórico fila
 * por fila, solo para mostrar. El diálogo de edición pide el detalle
 * completo con `GET /kardex-entries/:id` (ver `useKardexEntryById`), no
 * depende de esta fila. */
export interface KardexEntryListItem {
  id: string;
  entryDate: string;
  detail: string;
  movementTypeName: string;
  investorName: string | null;
  avgWeight: number;
  entryQuantity: number;
  entryKilos: number;
  exitQuantity: number;
  exitKilos: number;
  runningBalanceQuantity: number;
  runningBalanceKilos: number;
  /** Equivalente a `runningBalanceKilos` en dinero — solo se muestra si la
   * inversión es "por dinero" (ver `Investment.investmentTypeName`). */
  runningBalanceTotal: number;
  /** Reformulación contable de `total`, ya resuelta en el backend según el
   * tipo de movimiento — Ingreso es "Debe" (dinero que entra), Venta/Baja
   * son "Haber" (dinero que sale/se recupera; Baja siempre da `0`, nunca
   * tiene `total`). Para sumar Haber−Debe y saber si la inversión está en
   * ganancia o pérdida. */
  debe: number;
  haber: number;
}

export type KardexEntryFields = Omit<KardexEntry, 'id' | 'investmentId' | 'createdAt'>;

export interface CreateKardexEntryData extends KardexEntryFields {
  investmentId: string;
}

export type UpdateKardexEntryData = KardexEntryFields;
