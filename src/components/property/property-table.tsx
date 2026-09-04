import { Pencil, Trash2 } from 'lucide-react';
import type { Property } from '@/domain/property/property.entity';
import { formatDate } from '@/lib/format-date';

interface PropertyTableProps {
  properties: Property[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (property: Property) => void;
  onDeactivate: (property: Property) => void;
}

export function PropertyTable({ properties, loading, canEdit, canDelete, onEdit, onDeactivate }: PropertyTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 4 : 3;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Creada el</th>
            {showActions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id}>
              <td>{property.name}</td>
              <td>
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tipo-link"
                >
                  Ver en Google Maps
                </a>
              </td>
              <td>{formatDate(property.createdAt)}</td>
              {showActions && (
                <td>
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(property)}
                        className="data-action-btn"
                        aria-label="Editar"
                      >
                        <Pencil className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(property)}
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
          {properties.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="data-table-empty">
                No se encontraron propiedades
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
