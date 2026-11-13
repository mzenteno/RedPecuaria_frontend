/**
 * Formato de número estándar del proyecto (es-BO: punto de miles, coma
 * decimal, 2 decimales fijos) — usar esto en vez de instanciar
 * `Intl.NumberFormat` suelto en cada componente (antes duplicado en
 * `kardex-table.tsx`/`kardex-pdf.ts`), para que un cambio de formato sea un
 * solo lugar.
 */
const NUMBER_FORMAT = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

/** Para MOSTRAR un número (tablas, PDFs, dashboard, campos calculados): 0 se
 * muestra como "-" en vez de "0,00" (a pedido del usuario, 2026-11-10). No
 * usar en un input editable: ahí el valor tiene que poder tipearse. */
export function formatNumberOrDash(value: number): string {
  return value === 0 ? '-' : formatNumber(value);
}

/** Igual que `formatNumberOrDash`, para conteos enteros (cabezas,
 * cantidades) — sin decimales. */
export function formatCountOrDash(value: number): string {
  return value === 0 ? '-' : String(value);
}

/** Para mostrar un valor ya guardado (string numérico plano, ej. "36506.00")
 * con separador de miles — `''`/no numérico se muestra vacío, no "0,00" (no
 * inventar un valor que el usuario no cargó). */
export function formatDecimalInput(value: string): string {
  if (value === '') return '';
  const num = Number(value);
  return Number.isNaN(num) ? value : formatNumber(num);
}

/** Sanitiza lo que se tipea en un input de texto para un campo decimal —
 * deja solo dígitos y UN separador decimal, aceptando coma o punto mientras
 * se escribe (costumbre local) pero normalizando siempre a punto en el
 * valor "crudo" que se guarda (lo único que `Number(...)`/`computeAvgWeight`/
 * el schema de zod saben parsear). No agrega separador de miles acá — eso
 * es solo para cuando el input NO está enfocado, ver `FormattedNumberInput`. */
export function parseDecimalInput(raw: string): string {
  let cleaned = raw.replace(/[^\d.,]/g, '');
  cleaned = cleaned.replace(',', '.');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replaceAll('.', '');
  }
  return cleaned;
}
