/**
 * Formato de fecha estándar del proyecto: DD/MM/YYYY (ver ARCHITECTURE.md §2).
 * Usar esto en vez de `Intl.DateTimeFormat`/`toLocaleDateString` sueltos en
 * cada componente, para que un cambio de formato sea un solo lugar.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Para una fecha *pura* (`YYYY-MM-DD`, sin hora — ej. `KardexEntry.entryDate`),
 * no un timestamp. `formatDate` de arriba pasa por `new Date(...)`, que
 * interpreta un string sin hora como medianoche UTC — en un huso horario
 * negativo (Bolivia, UTC-4) eso se lee un día antes al mostrarlo en hora
 * local. Acá se parsea el string directo, sin ningún `Date` de por medio.
 */
export function formatDateOnly(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-');
  return `${day}/${month}/${year}`;
}
