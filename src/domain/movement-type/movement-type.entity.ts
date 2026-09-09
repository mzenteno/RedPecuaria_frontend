/** "ingreso"/"venta"/"baja" — catálogo cerrado sembrado por migración en el
 * backend (`kardex_movement_types`), sin CRUD propio. `name` es el valor
 * estable para decidir qué campos mostrar en el diálogo de Kardex (ver
 * `KardexEntryDialog`), no el `id` (autogenerado, no se puede asumir). */
export interface MovementType {
  id: string;
  name: string;
  isDeleted: boolean;
  createdAt: string;
}
