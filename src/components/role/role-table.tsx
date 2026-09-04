import { Pencil, Trash2 } from 'lucide-react';
import type { Role } from '@/domain/role/role.entity';
import { formatDate } from '@/lib/format-date';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (role: Role) => void;
  onDeactivate: (role: Role) => void;
}

export function RoleTable({ roles, loading, canEdit, canDelete, onEdit, onDeactivate }: RoleTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 3 : 2;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Creado el</th>
            {showActions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{formatDate(role.createdAt)}</td>
              {showActions && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        className="data-action-btn"
                        aria-label="Editar"
                      >
                        <Pencil className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(role)}
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
          {roles.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="data-table-empty">
                No se encontraron roles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
