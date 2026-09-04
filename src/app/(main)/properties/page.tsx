'use client';

import { useState } from 'react';
import { useProperties } from '@/hooks/property/use-properties';
import { useClientPagination } from '@/hooks/use-client-pagination';
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
  const { properties, isLoading, createProperty, updateProperty, deactivateProperty } = useProperties();
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    property: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Property | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = properties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const { page, setPage, totalPages, pageItems, total } = useClientPagination(filtered, PAGE_SIZE);

  function handleSearchChange(value: string): void {
    setSearch(value);
    setPage(1);
  }

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
          search={search}
          onSearchChange={handleSearchChange}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nueva propiedad"
          placeholder="Buscar por nombre..."
        />
        <PropertyTable
          properties={pageItems}
          loading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={openEdit}
          onDeactivate={setPendingDeactivate}
        />
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
        />
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
