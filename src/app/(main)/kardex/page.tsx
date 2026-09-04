'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProperties } from '@/hooks/property/use-properties';
import { useInvestments } from '@/hooks/investment/use-investments';
import { useKardexEntries } from '@/hooks/kardex/use-kardex-entries';
import { usePermission } from '@/hooks/menu/use-permission';
import type { KardexEntry, KardexEntryFields } from '@/domain/kardex/kardex-entry.entity';
import { Select } from '@/components/ui/select';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { KardexTable } from '@/components/kardex/kardex-table';
import { KardexEntryDialog } from '@/components/kardex/kardex-entry-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

// Menú propio, independiente de "Inversiones" (§14 de ARCHITECTURE.md): un
// rol puede tener acceso a Kardex sin tener acceso al CRUD de Inversiones
// (o viceversa). Pantalla de nivel superior en el sidebar, no un drill-down.
const MENU_KEY = 'kardex';

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntry | null;
  sessionId: number;
}

export default function KardexPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <KardexPageContent />
    </RequirePermission>
  );
}

function KardexPageContent() {
  const searchParams = useSearchParams();
  const { properties, isLoading: propertiesLoading } = useProperties();
  // Preseleccionados si se llega desde el botón "Ver kardex" de la tabla de
  // Inversiones — igual de válido elegirlos a mano acá si solo se tiene
  // permiso sobre Kardex y nunca se llega a ver esa tabla.
  const [propertyId, setPropertyId] = useState<string | null>(() => searchParams.get('propertyId'));
  const [investmentId, setInvestmentId] = useState<string | null>(() => searchParams.get('investmentId'));

  const { investments, isLoading: investmentsLoading } = useInvestments(propertyId);
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { entries, isLoading, createEntry, updateEntry, deactivateEntry } = useKardexEntries(investmentId);

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    entry: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<KardexEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedInvestment = investments.find((investment) => investment.id === investmentId) ?? null;
  const filtered = entries.filter((entry) => entry.detail.toLowerCase().includes(search.toLowerCase()));

  function handlePropertyChange(id: string | null): void {
    setPropertyId(id);
    setInvestmentId(null);
  }

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', entry: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(entry: KardexEntry): void {
    setDialog((prev) => ({ open: true, mode: 'edit', entry, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: KardexEntryFields): Promise<void> {
    if (!investmentId) return;
    if (dialog.mode === 'create') {
      await createEntry({ investmentId, ...data });
    } else if (dialog.entry) {
      await updateEntry(dialog.entry.id, data);
    }
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const entry = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateEntry(entry.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar el movimiento');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">
        Kardex{selectedInvestment ? ` — ${selectedInvestment.description} (${selectedInvestment.gestion})` : ''}
      </h1>
      <div className="card">
        <div className="border-b p-5 flex flex-wrap gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-xs w-full">
            <Select
              label="Propiedad"
              value={propertyId ?? ''}
              disabled={propertiesLoading}
              onChange={(e) => handlePropertyChange(e.target.value || null)}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="max-w-xs w-full">
            <Select
              label="Inversión"
              value={investmentId ?? ''}
              disabled={!propertyId || investmentsLoading}
              onChange={(e) => setInvestmentId(e.target.value || null)}
            >
              {investments.map((investment) => (
                <option key={investment.id} value={investment.id}>
                  {investment.description} ({investment.gestion})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {investmentId ? (
          <>
            <PageToolbar
              search={search}
              onSearchChange={setSearch}
              onNew={canCreate ? openCreate : undefined}
              newLabel="Nuevo movimiento"
              placeholder="Buscar por detalle..."
            />
            <KardexTable
              entries={filtered}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEdit}
              onDeactivate={setPendingDeactivate}
            />
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="tipo-muted">Selecciona una propiedad y una inversión para ver su kardex.</span>
          </div>
        )}
      </div>

      <KardexEntryDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        entry={dialog.entry}
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
