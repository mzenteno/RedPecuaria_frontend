import { Pencil, Trash2 } from 'lucide-react';
import type { KardexEntry, KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import type { User } from '@/domain/user/user.entity';
import { useMovementTypes } from '@/hooks/movement-type/use-movement-types';
import { formatDateOnly } from '@/lib/format-date';

interface KardexTableProps {
  entries: KardexEntryListItem[];
  /** Inversionistas de la inversión activa — para mostrar el nombre en vez
   * del id en la columna "Inversionista". */
  investors: User[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (entry: KardexEntry) => void;
  onDeactivate: (entry: KardexEntry) => void;
}

const NUMBER_FORMAT = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** "Saldo cant."/"Saldo kilos" son el histórico fila por fila
 * (`runningBalanceQuantity`/`runningBalanceKilos`) — el backend los calcula
 * al leer, con una función de ventana SQL sobre todo el historial de la
 * inversión, nunca los guarda (ver `docs/investment/investment.md` del
 * backend). Distinto del saldo VIGENTE de la inversión, que se muestra
 * arriba de esta tabla ("Saldo actual", en `page.tsx`). */
export function KardexTable({ entries, investors, loading, canEdit, canDelete, onEdit, onDeactivate }: KardexTableProps) {
  // Catálogo real (`GET /kardex-movement-types`), no 3 strings hardcodeados
  // — ver `KardexEntryDialog`. `staleTime` de 60s en el hook, así que no
  // duplica el request si el diálogo ya lo pidió.
  const { data: movementTypesData } = useMovementTypes();
  const movementTypes = movementTypesData ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  function investorName(investorUserId: string | null): string {
    if (!investorUserId) return '—';
    return investors.find((investor) => investor.id === investorUserId)?.fullName ?? '—';
  }

  function movementTypeLabel(movementTypeId: string): string {
    const name = movementTypes.find((type) => type.id === movementTypeId)?.name;
    return name ? capitalize(name) : '—';
  }

  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 12 : 11;

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
              <td>{movementTypeLabel(entry.movementTypeId)}</td>
              <td>{investorName(entry.investorUserId)}</td>
              <td className="text-right">{formatNumber(entry.avgWeight)}</td>
              <td className="text-right">{entry.entryQuantity}</td>
              <td className="text-right">{formatNumber(entry.entryKilos)}</td>
              <td className="text-right">{entry.exitQuantity}</td>
              <td className="text-right">{formatNumber(entry.exitKilos)}</td>
              <td className="text-right">{entry.runningBalanceQuantity}</td>
              <td className="text-right">{formatNumber(entry.runningBalanceKilos)}</td>
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
      </table>
    </div>
  );
}
