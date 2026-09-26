import { Pencil, Trash2 } from 'lucide-react';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';

interface KardexTableProps {
  entries: KardexEntryListItem[];
  /** 'kilo' o 'dinero' (`Investment.investmentTypeName`) — decide si las
   * columnas de Entrada/Salida/Saldo (y "Peso prom.") muestran kilos o
   * dinero. */
  investmentTypeName: string;
  /** Suma de Debe/Haber de TODO el historial activo de la inversión — no
   * de `entries` (la página que se ve), que daría un total incompleto si
   * hay más de una página. Vienen ya calculados del backend. */
  totalDebe: number;
  totalHaber: number;
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (entry: KardexEntryListItem) => void;
  onDeactivate: (entry: KardexEntryListItem) => void;
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** "Saldo cant."/"Saldo kilos" son el histórico fila por fila
 * (`runningBalanceQuantity`/`runningBalanceKilos`) — el backend los calcula
 * al leer, con una función de ventana SQL sobre todo el historial de la
 * inversión, nunca los guarda (ver `docs/investment/investment.md` del
 * backend). Distinto del saldo VIGENTE de la inversión, que se muestra
 * arriba de esta tabla ("Saldo actual", en `page.tsx`).
 *
 * "Debe"/"Haber" son la reformulación contable de `total` según el tipo de
 * movimiento (Ingreso = Debe, Venta/Baja = Haber) — ya vienen resueltas del
 * backend, acá solo se pintan. El footer es UNA sola fila ("TOTAL" +
 * `totalDebe`/`totalHaber` de TODO el historial, no de `entries`) — el resto
 * de columnas van con un `<td></td>` vacío cada una (sin `colSpan`, un
 * `<td>` por columna es más verboso pero más robusto).
 *
 * OJO: las celdas de este footer usan `font-semibold`, NUNCA `tipo-label`
 * — esa clase trae `display: block` (ver `globals.css`), pensada para
 * labels de formulario/badges DENTRO de otro elemento, no para ponerla
 * directo en un `<td>`. Aplicada sobre la celda misma le rompe el
 * `display: table-cell` y desarma el layout de toda la fila (bug real,
 * encontrado en vivo con el inspector — verificado que la sacar la clase
 * arregla el layout). Sin cálculo de ganancia/pérdida todavía — a pedido
 * del usuario, se saca del footer por ahora (queda pendiente para más
 * adelante).
 *
 * `investmentTypeName === 'dinero'`: "Peso prom."/"Kilos" (en los 3 pares
 * Entrada/Salida/Saldo) pasan a "Monto prom."/"Bs." — las celdas de
 * Entrada reusan `debe` (ya viene así: `total` cuando la fila es
 * "ingreso", 0 si no). "Saldo" usa `runningBalanceTotal` en vez de
 * `runningBalanceKilos`.
 *
 * "Salida" es el caso especial: en Venta viene de `haber`/`exitKilos`
 * (igual que antes), pero en **Baja** (2026-09-24) el valor que se resta
 * del saldo vive en `avgWeight` — reusado con otro título en el diálogo
 * ("Salida — kilos"/"Total Bs.", ver `KardexEntryDialog`). Por eso esta
 * columna mira `movementTypeName` para elegir de dónde sacar el valor.
 * "Peso/Monto prom." para Baja ya NO muestra nada (antes mostraba
 * `avgWeight` también ahí, duplicando el mismo número que "Salida" — dejó
 * de tener sentido como "promedio" una vez que pasó a ser el valor
 * directo).
 *
 * La columna "Haber" SÍ cuenta una Baja, pero solo si `isDinero`
 * (2026-09-26, corregido — antes daba `0` a propósito "para no ensuciar
 * Debe/Haber", pero una Baja también es plata que sale, igual que una
 * Venta): el backend ya resuelve `haber` por fila mirando si la inversión
 * es "por dinero" (ver `docs/investment/changes/2026-09-26-baja-en-el-haber.md`
 * del backend), pero en modo "por kilo" el valor de esa Baja es KILOS, no
 * plata — mostrarlo en Haber sería mostrar un número que no es dinero, así
 * que ahí se sigue dejando en blanco aunque el backend ya de por sí
 * devuelva `0`.
 *
 * **Celdas vacías, no "0,00"** (a pedido del usuario, 2026-09-24): en cada
 * fila, Entrada (cant./kilos-o-dinero) y Debe solo se muestran si la fila
 * es "ingreso"; Salida solo si es "venta"/"baja"; Haber solo si es "venta"
 * o ("baja" + `isDinero`); en cualquier otro caso la celda queda en
 * blanco — mismo criterio que usa `kardex-pdf.ts`. "Saldo"
 * (cant./kilos-o-dinero) nunca se vacía — es el acumulado corrido, siempre
 * tiene sentido mostrarlo. */
export function KardexTable({
  entries,
  investmentTypeName,
  totalDebe,
  totalHaber,
  loading,
  canEdit,
  canDelete,
  onEdit,
  onDeactivate,
}: KardexTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  const isDinero = investmentTypeName === 'dinero';
  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 14 : 13;

  return (
    <div className="data-table-wrapper">
      <table className="data-table" style={{ minWidth: '80rem' }}>
        <thead>
          {/* Encabezado de 2 filas — calca el agrupamiento Entrada/Salida/
              Saldo de la planilla de referencia (docs/investment/
              investment.md), con `colSpan`/`rowSpan` en vez de repetir el
              grupo en cada columna suelta ("Entrada cant."/"Entrada kilos"). */}
          <tr>
            <th rowSpan={2}>Fecha</th>
            <th rowSpan={2}>Detalle</th>
            <th rowSpan={2}>Tipo</th>
            <th rowSpan={2}>Inversionista</th>
            <th rowSpan={2} className="text-right">{isDinero ? 'Monto prom.' : 'Peso prom.'}</th>
            <th colSpan={2} className="text-center">Entrada</th>
            <th colSpan={2} className="text-center">Salida</th>
            <th colSpan={2} className="text-center">Saldo</th>
            <th rowSpan={2} className="text-right">Debe</th>
            <th rowSpan={2} className="text-right">Haber</th>
            {showActions && <th rowSpan={2} className="text-center">Acciones</th>}
          </tr>
          <tr>
            <th className="text-right">Cant.</th>
            <th className="text-right">{isDinero ? 'Bs.' : 'Kilos'}</th>
            <th className="text-right">Cant.</th>
            <th className="text-right">{isDinero ? 'Bs.' : 'Kilos'}</th>
            <th className="text-right">Cant.</th>
            <th className="text-right">{isDinero ? 'Bs.' : 'Kilos'}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isIngreso = entry.movementTypeName === 'ingreso';
            const isVenta = entry.movementTypeName === 'venta';
            const isBaja = entry.movementTypeName === 'baja';
            return (
            <tr key={entry.id}>
              <td>{formatDateOnly(entry.entryDate)}</td>
              <td>{entry.detail}</td>
              <td>{capitalize(entry.movementTypeName)}</td>
              <td>{entry.investorName ?? '—'}</td>
              <td className="text-right">{isBaja ? '' : formatNumber(entry.avgWeight)}</td>
              <td className="text-right">{isIngreso ? entry.entryQuantity : ''}</td>
              <td className="text-right">
                {isIngreso ? formatNumber(isDinero ? entry.debe : entry.entryKilos) : ''}
              </td>
              <td className="text-right">{isVenta || isBaja ? entry.exitQuantity : ''}</td>
              <td className="text-right">
                {isBaja
                  ? formatNumber(entry.avgWeight)
                  : isVenta
                    ? formatNumber(isDinero ? entry.haber : entry.exitKilos)
                    : ''}
              </td>
              <td className="text-right">{entry.runningBalanceQuantity}</td>
              <td className="text-right">
                {formatNumber(isDinero ? entry.runningBalanceTotal : entry.runningBalanceKilos)}
              </td>
              <td className="text-right">{isIngreso ? formatNumber(entry.debe) : ''}</td>
              <td className="text-right">{isVenta || (isBaja && isDinero) ? formatNumber(entry.haber) : ''}</td>
              {showActions && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="data-action-btn"
                        aria-label="Editar"
                      >
                        <Pencil className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(entry)}
                        className="data-action-btn"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
            );
          })}
          {entries.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="data-table-empty">
                No se encontraron movimientos
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="font-semibold">TOTAL</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td className="text-right font-semibold">{formatNumber(totalDebe)}</td>
            <td className="text-right font-semibold">{formatNumber(totalHaber)}</td>
            {showActions && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
