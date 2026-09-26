import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import type { InvestmentListItem } from '@/features/investments/investment.entity';
import type { UserOption } from '@/domain/user/user.entity';
import { formatDate } from '@/lib/format-date';

interface InvestmentTableProps {
  investments: InvestmentListItem[];
  investors: UserOption[];
  loading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Menú `kardex` es independiente de `investments` — un rol puede no
   * tenerlo, y ahí no tiene sentido mostrar el atajo. */
  canViewKardex: boolean;
  onEdit: (investment: InvestmentListItem) => void;
  onDeactivate: (investment: InvestmentListItem) => void;
  onViewKardex: (investment: InvestmentListItem) => void;
}

export function InvestmentTable({
  investments,
  investors,
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

  function capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table" style={{ minWidth: '64rem' }}>
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Gestión</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Inversionistas</th>
            <th>Creada el</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => (
            <tr key={investment.id}>
              <td>{investment.propertyName}</td>
              <td>{investment.gestion}</td>
              <td>{investment.description}</td>
              <td>{capitalize(investment.investmentTypeName)}</td>
              <td>
                <span
                  className="tipo-label"
                  style={{
                    color: investment.isFinished ? 'var(--text-muted)' : 'var(--primary)',
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
              <td colSpan={8} className="data-table-empty">
                No se encontraron inversiones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
