import { Pencil, Trash2 } from 'lucide-react';
import type { KardexEntry } from '@/domain/kardex/kardex-entry.entity';
import { KARDEX_MOVEMENT_TYPE_OPTIONS } from '@/domain/kardex/kardex-entry.entity';
import type { User } from '@/domain/user/user.entity';
import { formatDateOnly } from '@/lib/format-date';

interface KardexTableProps {
  entries: KardexEntry[];
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

function movementTypeLabel(movementType: KardexEntry['movementType']): string {
  return KARDEX_MOVEMENT_TYPE_OPTIONS.find((option) => option.value === movementType)?.label ?? movementType;
}

export function KardexTable({ entries, investors, loading, canEdit, canDelete, onEdit, onDeactivate }: KardexTableProps) {
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

  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 13 : 12;

  return (
    <div className="data-table-wrapper">
      <table className="data-table" style={{ minWidth: '80rem' }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Detalle</th>
            <th>Tipo</th>
            <th>Inversionista</th>
            <th className="text-right">Peso prom.</th>
            <th className="text-right">Entrada cant.</th>
            <th className="text-right">Entrada kilos</th>
            <th className="text-right">Salida cant.</th>
            <th className="text-right">Salida kilos</th>
            <th className="text-right">Saldo cant.</th>
            <th className="text-right">Saldo kilos</th>
            <th className="text-right">Total</th>
            {showActions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDateOnly(entry.entryDate)}</td>
              <td>{entry.detail}</td>
              <td>{movementTypeLabel(entry.movementType)}</td>
              <td>{investorName(entry.investorUserId)}</td>
              <td className="text-right">{formatNumber(entry.avgWeight)}</td>
              <td className="text-right">{entry.entryQuantity}</td>
              <td className="text-right">{formatNumber(entry.entryKilos)}</td>
              <td className="text-right">{entry.exitQuantity}</td>
              <td className="text-right">{formatNumber(entry.exitKilos)}</td>
              <td className="text-right">{entry.balanceQuantity}</td>
              <td className="text-right">{formatNumber(entry.balanceKilos)}</td>
              <td className="text-right">{formatNumber(entry.total)}</td>
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
