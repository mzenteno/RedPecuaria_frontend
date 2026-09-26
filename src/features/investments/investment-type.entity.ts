/** "kilo"/"dinero" — catálogo cerrado sembrado por migración en el backend
 * (`investment_types`), sin CRUD propio. `name` es el valor estable para
 * decidir qué campos/columnas mostrar (Kardex, la tabla, el PDF) — nunca el
 * `id` (autogenerado, no se puede asumir). Fijo desde la creación de la
 * inversión, no se edita después (ver `investment.repository.ts`). */
export interface InvestmentType {
  id: string;
  name: string;
  createdAt: string;
}
