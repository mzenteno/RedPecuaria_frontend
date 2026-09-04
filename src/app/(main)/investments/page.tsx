'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProperties } from '@/hooks/property/use-properties';
import { useInvestments } from '@/hooks/investment/use-investments';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePermission } from '@/hooks/menu/use-permission';
import type { Investment } from '@/domain/investment/investment.entity';
import { Select } from '@/components/ui/select';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InvestmentTable } from '@/components/investment/investment-table';
import { InvestmentDialog } from '@/components/investment/investment-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'investments';

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  investment: Investment | null;
  sessionId: number;
}

export default function InvestmentsPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <InvestmentsPageContent />
    </RequirePermission>
  );
}

function InvestmentsPageContent() {
  const router = useRouter();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { canView: canViewKardex } = usePermission('kardex');
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    investment: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Investment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { investments, isLoading, createInvestment, updateInvestment, deactivateInvestment } =
    useInvestments(propertyId);
  const { investors } = useInvestorUsers();

  const filtered = investments.filter((investment) =>
    investment.description.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', investment: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(investment: Investment): void {
    setDialog((prev) => ({ open: true, mode: 'edit', investment, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: { gestion: number; description: string; investorUserIds: string[] }): Promise<void> {
    if (!propertyId) return;
    if (dialog.mode === 'create') {
      await createInvestment({ propertyId, ...data });
    } else if (dialog.investment) {
      await updateInvestment(dialog.investment.id, data);
    }
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const investment = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateInvestment(investment.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar la inversión');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Inversiones</h1>
      <div className="card">
        <div className="border-b p-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-xs">
            <Select
              label="Propiedad"
              value={propertyId ?? ''}
              disabled={propertiesLoading}
              onChange={(e) => setPropertyId(e.target.value || null)}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {propertyId ? (
          <>
            <PageToolbar
              search={search}
              onSearchChange={setSearch}
              onNew={canCreate ? openCreate : undefined}
              newLabel="Nueva inversión"
              placeholder="Buscar por descripción..."
            />
            <InvestmentTable
              investments={filtered}
              investors={investors}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              canViewKardex={canViewKardex}
              onEdit={openEdit}
              onDeactivate={setPendingDeactivate}
              onViewKardex={(investment) =>
                router.push(`/kardex?propertyId=${propertyId}&investmentId=${investment.id}`)
              }
            />
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="tipo-muted">Selecciona una propiedad para ver sus inversiones.</span>
          </div>
        )}
      </div>

      <InvestmentDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        investment={dialog.investment}
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
