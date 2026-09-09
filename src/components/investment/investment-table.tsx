import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import type { Investment } from '@/domain/investment/investment.entity';
import type { Property } from '@/domain/property/property.entity';
import type { User } from '@/domain/user/user.entity';
import { formatDate } from '@/lib/format-date';

interface InvestmentTableProps {
  investments: Investment[];
  investors: User[];
  /** Ahora que "Gestión" (no "Propiedad") es el filtro que dispara la
   * consulta, la tabla puede mostrar inversiones de varias propiedades a
   * la vez — hace falta la columna para saber de cuál es cada una. */
  properties: Property[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Menú `kardex` es independiente de `investments` — un rol puede no
   * tenerlo, y ahí no tiene sentido mostrar el atajo. */
  canViewKardex: boolean;
  onEdit: (investment: Investment) => void;
  onDeactivate: (investment: Investment) => void;
  onViewKardex: (investment: Investment) => void;
}

export function InvestmentTable({
  investments,
  investors,
  properties,
  loading,
  canEdit,
  canDelete,
  canViewKardex,
  onEdit,
  onDeactivate,
  onViewKardex,
}: InvestmentTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="tipo-muted">Cargando...</span>
      </div>
    );
  }

  function investorNames(investorIds: string[]): string {
    const names = investorIds
      .map((id) => investors.find((investor) => investor.id === id)?.fullName)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(', ') : '—';
  }

  function propertyName(propertyId: string): string {
    return properties.find((property) => property.id === propertyId)?.name ?? '—';
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table" style={{ minWidth: '64rem' }}>
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Gestión</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Inversionistas</th>
            <th>Creada el</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => (
            <tr key={investment.id}>
              <td>{propertyName(investment.propertyId)}</td>
              <td>{investment.gestion}</td>
              <td>{investment.description}</td>
              <td>
                <span
                  className="tipo-label"
                  style={{
                    padding: '0.125rem 0.5rem',
                    color: investment.isFinished ? 'var(--text-muted)' : 'var(--primary)',
                    background: investment.isFinished ? 'var(--bg-input)' : 'var(--primary-light)',
                  }}
                >
                  {investment.isFinished ? 'Terminada' : 'Activa'}
                </span>
              </td>
              <td>{investorNames(investment.investorIds)}</td>
              <td>{formatDate(investment.createdAt)}</td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  {canViewKardex && (
                    <button
                      type="button"
                      onClick={() => onViewKardex(investment)}
                      className="data-action-btn"
                      aria-label="Ver kardex"
                    >
                      <ClipboardList className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(investment)}
                      className="data-action-btn"
                      aria-label="Editar"
                    >
                      <Pencil className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDeactivate(investment)}
                      className="data-action-btn"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {investments.length === 0 && (
            <tr>
              <td colSpan={7} className="data-table-empty">
                No se encontraron inversiones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
