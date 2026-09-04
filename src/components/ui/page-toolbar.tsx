import { Plus, Search } from 'lucide-react';

interface PageToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** Si no se pasa (ej. el rol no tiene `canCreate` sobre este menú, ver
   * `usePermission`), el botón "Nuevo" directamente no se muestra. */
  onNew?: () => void;
  newLabel?: string;
  placeholder?: string;
}

export function PageToolbar({
  search,
  onSearchChange,
  onNew,
  newLabel = 'Nuevo',
  placeholder = 'Buscar...',
}: PageToolbarProps) {
  return (
    <div className="page-toolbar">
      <div className="toolbar-search">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--text-placeholder)' }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="toolbar-search-input"
        />
      </div>
      {onNew && (
        <button type="button" onClick={onNew} className="toolbar-btn-primary">
          <Plus className="h-4 w-4" />
          {newLabel}
        </button>
      )}
    </div>
  );
}
