/** Primera letra en mayúscula — para mostrar nombres de catálogo guardados
 * en minúscula (ej. `investmentTypeName` `'kilo'` → "Kilo"). Antes
 * duplicado en cada tabla/diálogo de Inversiones y Kardex. */
export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
