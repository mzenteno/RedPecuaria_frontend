'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePropertyOptions } from '@/hooks/property/use-property-options';
import { useInvestmentsByGestion } from '@/hooks/investment/use-investments-by-gestion';
import { useInvestmentsByProperty } from '@/hooks/investment/use-investments-by-property';
import { useInvestmentsByInvestor } from '@/hooks/investment/use-investments-by-investor';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePermission } from '@/hooks/menu/use-permission';
import type { Investment } from '@/domain/investment/investment.entity';
import type { ListInvestmentsByGestionParams } from '@/domain/investment/list-investments-by-gestion.use-case';
import type { ListInvestmentsByPropertyPaginatedParams } from '@/domain/investment/list-investments-by-property-paginated.use-case';
import type { ListInvestmentsByInvestorParams } from '@/domain/investment/list-investments-by-investor.use-case';
import { Select } from '@/components/ui/select';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InvestmentTable } from '@/components/investment/investment-table';
import { InvestmentDialog } from '@/components/investment/investment-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'investments';
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const CURRENT_YEAR = new Date().getFullYear();
// Mismo rango que el combobox de "Gestión" del diálogo de alta/edición
// (`investment-dialog.tsx`) — del año que viene hasta 6 para atrás.
const GESTION_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 1 - i);

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  investment: Investment | null;
  sessionId: number;
}

export default function InvestmentsPage() {
  const searchParams = useSearchParams();
  // Mismo motivo que en `kardex/page.tsx`: ir de "/investments?gestion=&
  // propertyId=" (al volver del kardex) a "/investments" (clic directo en
  // el ítem del sidebar) es la misma ruta — sin esta `key`, Next no
  // remonta el componente y los filtros quedan pegados del clic anterior.
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <InvestmentsPageContent key={searchParams.toString()} />
    </RequirePermission>
  );
}

function InvestmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties, isLoading: propertiesLoading } = usePropertyOptions();
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { canView: canViewKardex } = usePermission('kardex');
  // Preseleccionados si se vuelve del kardex por "Volver a Inversiones" —
  // ese link manda los mismos filtros que estaban activos cuando se hizo
  // clic en "Ver kardex" (`kardex/page.tsx`), para no perderlos.
  const [gestion, setGestion] = useState<string>(() => searchParams.get('gestion') ?? '');
  const [propertyId, setPropertyId] = useState<string | null>(() => searchParams.get('propertyId'));
  const [investorUserId, setInvestorUserId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    investment: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Investment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Búsqueda de servidor: como el listado pagina de verdad, un filtro que
  // solo mirara la página ya descargada sería engañoso — el debounce evita
  // mandar un request por letra.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function handleGestionChange(value: string): void {
    setGestion(value);
    setPage(1);
  }

  function handlePropertyChange(value: string | null): void {
    setPropertyId(value);
    setPage(1);
  }

  function handleInvestorChange(value: string | null): void {
    setInvestorUserId(value);
    setPage(1);
  }

  // Los tres combos son formas independientes de traer la lista —
  // cualquiera de los tres alcanza para ver algo, ninguno depende de los
  // otros dos. Si los tres están vacíos no hay nada que mostrar. La
  // prioridad (Gestión > Inversionista > Propiedad) solo decide cuál de
  // los tres es el que dispara la consulta cuando hay más de uno elegido
  // — los otros dos, ahí, viajan como filtro extra al servidor (nunca se
  // filtra del lado del cliente: con paginación real, filtrar solo la
  // página ya traída daría un resultado incompleto).
  const activeMode: 'gestion' | 'investor' | 'property' | null = gestion
    ? 'gestion'
    : investorUserId
      ? 'investor'
      : propertyId
        ? 'property'
        : null;

  const gestionParams: ListInvestmentsByGestionParams | null =
    activeMode === 'gestion'
      ? {
          gestion: Number(gestion),
          page,
          pageSize: PAGE_SIZE,
          propertyId: propertyId ?? undefined,
          investorUserId: investorUserId ?? undefined,
          search: search || undefined,
        }
      : null;

  const investorParams: ListInvestmentsByInvestorParams | null =
    activeMode === 'investor'
      ? {
          investorUserId: investorUserId as string,
          page,
          pageSize: PAGE_SIZE,
          propertyId: propertyId ?? undefined,
          search: search || undefined,
        }
      : null;

  const propertyParams: ListInvestmentsByPropertyPaginatedParams | null =
    activeMode === 'property'
      ? {
          propertyId: propertyId as string,
          page,
          pageSize: PAGE_SIZE,
          search: search || undefined,
        }
      : null;

  const byGestion = useInvestmentsByGestion(gestionParams);
  const byInvestor = useInvestmentsByInvestor(investorParams);
  const byProperty = useInvestmentsByProperty(propertyParams);
  const { investments, total, totalPages, isLoading, createInvestment, updateInvestment, deactivateInvestment } =
    activeMode === 'investor' ? byInvestor : activeMode === 'property' ? byProperty : byGestion;
  const { investors } = useInvestorUsers();

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
        <div
          className="border-b p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Select
            label="Gestión"
            value={gestion}
            onChange={(e) => handleGestionChange(e.target.value)}
            onClear={() => handleGestionChange('')}
          >
            {GESTION_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select
            label="Propiedad"
            value={propertyId ?? ''}
            disabled={propertiesLoading}
            onChange={(e) => handlePropertyChange(e.target.value || null)}
            onClear={() => handlePropertyChange(null)}
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </Select>
          <Select
            label="Inversionista"
            value={investorUserId ?? ''}
            onChange={(e) => handleInvestorChange(e.target.value || null)}
            onClear={() => handleInvestorChange(null)}
          >
            {investors.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.fullName}
              </option>
            ))}
          </Select>
        </div>

        {activeMode ? (
          <>
            <PageToolbar
              search={searchInput}
              onSearchChange={setSearchInput}
              onNew={canCreate && propertyId ? openCreate : undefined}
              newLabel="Nueva inversión"
              placeholder="Buscar por descripción..."
            />
            <InvestmentTable
              investments={investments}
              investors={investors}
              properties={properties}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              canViewKardex={canViewKardex}
              onEdit={openEdit}
              onDeactivate={setPendingDeactivate}
              onViewKardex={(investment) =>
                router.push(
                  `/kardex?propertyId=${investment.propertyId}&investmentId=${investment.id}&gestion=${gestion}`,
                )
              }
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="tipo-muted">Selecciona una gestión, una propiedad o un inversionista para ver inversiones.</span>
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
