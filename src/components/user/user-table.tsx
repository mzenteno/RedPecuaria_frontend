import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '@/domain/user/user.entity';
import type { UserType } from '@/domain/user-type/user-type.entity';
import { formatDate } from '@/lib/format-date';

interface UserTableProps {
  users: User[];
  userTypes: UserType[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
}

export function UserTable({ users, userTypes, loading, canEdit, canDelete, onEdit, onDeactivate }: UserTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 6 : 5;

  function userTypeName(userTypeId: string): string {
    return userTypes.find((type) => type.id === userTypeId)?.name ?? '—';
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre completo</th>
            <th>Email</th>
            <th>Tipo de usuario</th>
            <th>Creado el</th>
            {showActions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{userTypeName(user.userTypeId)}</td>
              <td>{formatDate(user.createdAt)}</td>
              {showActions && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="data-action-btn"
                        aria-label="Editar"
                      >
                        <Pencil className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(user)}
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
          {users.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="data-table-empty">
                No se encontraron usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
