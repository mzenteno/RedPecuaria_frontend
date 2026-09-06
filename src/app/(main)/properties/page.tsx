'use client';

import { useEffect, useState } from 'react';
import { useProperties } from '@/hooks/property/use-properties';
import { usePermission } from '@/hooks/menu/use-permission';
import type { Property } from '@/domain/property/property.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PropertyTable } from '@/components/property/property-table';
import { PropertyDialog } from '@/components/property/property-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'properties';
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  property: Property | null;
  sessionId: number;
}

export default function PropertiesPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <PropertiesPageContent />
    </RequirePermission>
  );
}

function PropertiesPageContent() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Búsqueda de servidor: a diferencia de "Empresas" (filtra un array ya
  // descargado), acá cada tecleo dispararía un `GET /properties?search=`
  // nuevo — el debounce evita mandar un request por letra.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { properties, isLoading, total, totalPages, createProperty, updateProperty, deactivateProperty } =
    useProperties(page, PAGE_SIZE, search);
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    property: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Property | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', property: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(property: Property): void {
    setDialog((prev) => ({ open: true, mode: 'edit', property, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: { name: string; latitude: number; longitude: number }): Promise<void> {
    if (dialog.mode === 'create') {
      await createProperty(data);
    } else if (dialog.property) {
      await updateProperty(dialog.property.id, data);
    }
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const property = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateProperty(property.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar la propiedad');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Propiedades</h1>
      <div className="card">
        <PageToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nueva propiedad"
          placeholder="Buscar por nombre..."
        />
        <PropertyTable
          properties={properties}
          loading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={openEdit}
          onDeactivate={setPendingDeactivate}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <PropertyDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        property={dialog.property}
        onClose={closeDialog}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={pendingDeactivate !== null}
        title="Eliminar este registro"
        description="¿Está seguro de eliminar el registro?"
        confirmLabel="Eliminar"
        onConfirm={confirmDeactivate}
        onCancel={() => setPendingDeactivate(null)}
      />

      <ConfirmDialog
        open={errorMessage !== null}
        title="Error"
        description={errorMessage ?? ''}
        confirmLabel="Entendido"
        onConfirm={() => setErrorMessage(null)}
      />
    </div>
  );
}
