import { Pencil, Trash2 } from 'lucide-react';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from '@/lib/format-date';
import { formatNumber } from '@/lib/format-number';

interface KardexTableProps {
  entries: KardexEntryListItem[];
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
 * adelante). */
export function KardexTable({
  entries,
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
            <th rowSpan={2} className="text-right">Peso prom.</th>
            <th colSpan={2} className="text-center">Entrada</th>
            <th colSpan={2} className="text-center">Salida</th>
            <th colSpan={2} className="text-center">Saldo</th>
            <th rowSpan={2} className="text-right">Debe</th>
            <th rowSpan={2} className="text-right">Haber</th>
            {showActions && <th rowSpan={2} className="text-center">Acciones</th>}
          </tr>
          <tr>
            <th className="text-right">Cant.</th>
            <th className="text-right">Kilos</th>
            <th className="text-right">Cant.</th>
            <th className="text-right">Kilos</th>
            <th className="text-right">Cant.</th>
            <th className="text-right">Kilos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDateOnly(entry.entryDate)}</td>
              <td>{entry.detail}</td>
              <td>{capitalize(entry.movementTypeName)}</td>
              <td>{entry.investorName ?? '—'}</td>
              <td className="text-right">{formatNumber(entry.avgWeight)}</td>
              <td className="text-right">{entry.entryQuantity}</td>
              <td className="text-right">{formatNumber(entry.entryKilos)}</td>
              <td className="text-right">{entry.exitQuantity}</td>
              <td className="text-right">{formatNumber(entry.exitKilos)}</td>
              <td className="text-right">{entry.runningBalanceQuantity}</td>
              <td className="text-right">{formatNumber(entry.runningBalanceKilos)}</td>
              <td className="text-right">{formatNumber(entry.debe)}</td>
              <td className="text-right">{formatNumber(entry.haber)}</td>
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
          ))}
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
