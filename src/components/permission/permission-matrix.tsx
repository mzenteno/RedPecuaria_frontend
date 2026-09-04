import type { MenuPermissionRow } from '@/hooks/permission/use-role-permissions';

type PermissionField = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';

interface PermissionMatrixProps {
  rows: MenuPermissionRow[];
  loading: boolean;
  /** `true` si el rol actual no tiene `canEdit` sobre el menú "Permisos" —
   * las casillas se muestran pero no se pueden tocar. */
  readOnly: boolean;
  onToggle: (row: MenuPermissionRow, field: PermissionField) => void;
}

const COLUMNS: { field: PermissionField; label: string }[] = [
  { field: 'canView', label: 'Ver' },
  { field: 'canCreate', label: 'Crear' },
  { field: 'canEdit', label: 'Editar' },
  { field: 'canDelete', label: 'Eliminar' },
];

export function PermissionMatrix({ rows, loading, readOnly, onToggle }: PermissionMatrixProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Menú</th>
            {COLUMNS.map((col) => (
              <th key={col.field} className="text-center">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.menuId}>
              <td>{row.menuLabel}</td>
              {COLUMNS.map((col) => (
                <td key={col.field} className="text-center">
                  <input
                    type="checkbox"
                    checked={row[col.field]}
                    disabled={readOnly}
                    onChange={() => onToggle(row, col.field)}
                    aria-label={`${col.label} — ${row.menuLabel}`}
                    className="h-4 w-4 cursor-pointer accent-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="data-table-empty">
                No hay menús para configurar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
