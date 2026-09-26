'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { usePropertyOptions } from '@/hooks/property/use-property-options';
import { useInvestmentsByGestion } from '@/hooks/investment/use-investments-by-gestion';
import { useInvestmentsByProperty } from '@/hooks/investment/use-investments-by-property';
import { useInvestmentsByInvestor } from '@/hooks/investment/use-investments-by-investor';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePermission } from '@/hooks/menu/use-permission';
import type { InvestmentListItem } from '@/features/investments/investment.entity';
import type {
  ListInvestmentsByGestionParams,
  ListInvestmentsByPropertyPaginatedParams,
  ListInvestmentsByInvestorParams,
} from '@/features/investments/investment.repository';
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
  investment: InvestmentListItem | null;
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
  // ese link manda EXACTAMENTE los mismos filtros (y la misma página/
  // búsqueda) que estaban activos cuando se hizo clic en "Ver kardex"
  // (`kardex/page.tsx`), con estos mismos nombres de parámetro, para no
  // perder nada ni "adivinar" un filtro nuevo a partir de la inversión
  // puntual que se abrió.
  const [gestion, setGestion] = useState<string>(() => searchParams.get('gestion') ?? '');
  const [propertyId, setPropertyId] = useState<string | null>(() => searchParams.get('propertyId'));
  const [investorUserId, setInvestorUserId] = useState<string | null>(() => searchParams.get('investorUserId'));
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [page, setPage] = useState(() => Number(searchParams.get('page') ?? '1'));
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    investment: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<InvestmentListItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Búsqueda de servidor: como el listado pagina de verdad, un filtro que
  // solo mirara la página ya descargada sería engañoso — el debounce evita
  // mandar un request por letra. Se salta el primer disparo (montaje): sin
  // esto, `page` restaurado desde la URL (arriba) se pisaba solo a 1 apenas
  // cargaba la pantalla, aunque el usuario no haya tocado el buscador.
  const isFirstSearchEffect = useRef(true);
  useEffect(() => {
    if (isFirstSearchEffect.current) {
      isFirstSearchEffect.current = false;
      return;
    }
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

  /** `investmentId` es para que `kardex/page.tsx` pida `GET
   * /investments/:id` y resuelva de una toda la inversión puntual (antes
   * hacía falta mandar también `investmentPropertyId` para buscarla dentro
   * de la lista de su propiedad — ya no, ese endpoint devuelve todo, ver
   * el change de este cambio). El resto (`gestion`/`propertyId`/
   * `investorUserId`/`search`/`page`) son los filtros que tiene ESTA
   * pantalla ahora mismo, para que "Volver a Inversiones" los reconstruya
   * tal cual, sin inventar un filtro de Propiedad a partir de la inversión
   * que se abrió (bug real: antes pasaba `investment.propertyId` como si
   * fuera el filtro de Propiedad de la pantalla, aunque no hubiera ninguno
   * elegido). */
  function buildKardexShortcutQuery(investment: InvestmentListItem): string {
    const params = new URLSearchParams();
    params.set('investmentId', investment.id);
    if (gestion) params.set('gestion', gestion);
    if (propertyId) params.set('propertyId', propertyId);
    if (investorUserId) params.set('investorUserId', investorUserId);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    return params.toString();
  }

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', investment: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(investment: InvestmentListItem): void {
    setDialog((prev) => ({ open: true, mode: 'edit', investment, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: {
    propertyId: string;
    investmentTypeId: string;
    gestion: number;
    description: string;
    investorUserIds: string[];
    isFinished: boolean;
  }): Promise<void> {
    if (dialog.mode === 'create') {
      // Una inversión recién creada siempre arranca activa — `isFinished`
      // ni siquiera existe en `CreateInvestmentData` (el diálogo lo manda
      // igual porque comparte el mismo formulario, pero acá se descarta).
      const { propertyId, investmentTypeId, gestion, description, investorUserIds } = data;
      await createInvestment({ propertyId, investmentTypeId, gestion, description, investorUserIds });
    } else if (dialog.investment) {
      // `investmentTypeId` viaja igual (el diálogo lo manda siempre) pero
      // no existe en `UpdateInvestmentData` ni en el DTO del backend — se
      // ignora acá y el backend lo descartaría igual si llegara.
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
          {canCreate && (
            // Siempre visible, sin importar `activeMode` — antes dependía de
            // tener una Propiedad ya elegida en el filtro de abajo, pero
            // crear una inversión ya no necesita eso: `InvestmentDialog`
            // tiene su propio combo de Propiedad (ver `frontend/
            // ARCHITECTURE.md` §14).
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={openCreate} className="toolbar-btn-primary">
                <Plus className="h-4 w-4" />
                Nueva inversión
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>

        {activeMode ? (
          <>
            <PageToolbar
              search={searchInput}
              onSearchChange={setSearchInput}
              placeholder="Buscar por descripción..."
            />
            <InvestmentTable
              investments={investments}
              investors={investors}
              loading={isLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              canViewKardex={canViewKardex}
              onEdit={openEdit}
              onDeactivate={setPendingDeactivate}
              onViewKardex={(investment) => router.push(`/kardex?${buildKardexShortcutQuery(investment)}`)}
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
        defaultPropertyId={propertyId}
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
