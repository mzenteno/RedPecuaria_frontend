import { Pencil, Trash2 } from 'lucide-react';
import type { Company } from '@/domain/company/company.entity';
import { formatDate } from '@/lib/format-date';

interface CompanyTableProps {
  companies: Company[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (company: Company) => void;
  onDeactivate: (company: Company) => void;
}

export function CompanyTable({ companies, loading, canEdit, canDelete, onEdit, onDeactivate }: CompanyTableProps) {
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
            <th>Creada el</th>
            {showActions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>{formatDate(company.createdAt)}</td>
              {showActions && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(company)}
                        className="data-action-btn"
                        aria-label="Editar"
                      >
                        <Pencil className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(company)}
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
          {companies.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="data-table-empty">
                No se encontraron empresas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
