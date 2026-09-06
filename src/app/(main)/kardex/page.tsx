'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { usePropertyOptions } from '@/hooks/property/use-property-options';
import { useInvestments } from '@/hooks/investment/use-investments';
import { useMyInvestments } from '@/hooks/investment/use-my-investments';
import { useKardexEntries } from '@/hooks/kardex/use-kardex-entries';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePermission } from '@/hooks/menu/use-permission';
import type { KardexEntry, KardexEntryFields } from '@/domain/kardex/kardex-entry.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { KardexTable } from '@/components/kardex/kardex-table';
import { KardexEntryDialog } from '@/components/kardex/kardex-entry-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

// Menú propio, independiente de "Inversiones" (§14 de ARCHITECTURE.md): un
// rol puede tener acceso a Kardex sin tener acceso al CRUD de Inversiones
// (o viceversa). Pantalla de nivel superior en el sidebar, no un drill-down.
const MENU_KEY = 'kardex';
const MY_INVESTMENTS_PAGE_SIZE = 10;
const ENTRIES_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntry | null;
  sessionId: number;
}

export default function KardexPage() {
  const searchParams = useSearchParams();
  // Ir de "/kardex?propertyId=&investmentId=&gestion=" (atajo) a "/kardex"
  // (clic directo en el ítem del sidebar) es la MISMA ruta — Next no
  // remonta el componente solo porque cambia el query string, así que el
  // estado local (`investmentId`, etc.) quedaba pegado del clic anterior.
  // La `key` fuerza el remount cada vez que cambia la URL de esta pantalla.
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <KardexPageContent key={searchParams.toString()} />
    </RequirePermission>
  );
}

function KardexPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { properties } = usePropertyOptions();
  // Atajo desde la tabla de Inversiones ("Ver kardex"): llega con los tres
  // en la URL. `propertyId` solo se usa para resolver esa inversión puntual
  // — la lista de abajo siempre es "mis inversiones", no las de esa
  // propiedad. `shortcutGestion` viaja solo para poder reconstruir esos
  // mismos filtros al volver (ver el botón "Volver a Inversiones").
  const [shortcutPropertyId] = useState<string | null>(() => searchParams.get('propertyId'));
  const [shortcutGestion] = useState<string | null>(() => searchParams.get('gestion'));
  const [investmentId, setInvestmentId] = useState<string | null>(() => searchParams.get('investmentId'));
  const [myInvestmentsPage, setMyInvestmentsPage] = useState(1);

  const {
    investments: myInvestments,
    total: myInvestmentsTotal,
    totalPages: myInvestmentsTotalPages,
    isLoading: myInvestmentsLoading,
  } = useMyInvestments(myInvestmentsPage, MY_INVESTMENTS_PAGE_SIZE);
  const { investments: shortcutInvestments } = useInvestments(shortcutPropertyId);
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { investors: allInvestors } = useInvestorUsers();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [entriesPage, setEntriesPage] = useState(1);

  // Búsqueda de servidor: como el listado pagina de verdad, un filtro que
  // solo mirara la página ya descargada sería engañoso — el debounce evita
  // mandar un request por letra.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setEntriesPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    entries,
    total: entriesTotal,
    totalPages: entriesTotalPages,
    isLoading,
    createEntry,
    updateEntry,
    deactivateEntry,
  } = useKardexEntries(investmentId, entriesPage, ENTRIES_PAGE_SIZE, search);

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    entry: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<KardexEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedInvestment =
    myInvestments.find((investment) => investment.id === investmentId) ??
    shortcutInvestments.find((investment) => investment.id === investmentId) ??
    null;
  // Solo los inversionistas de ESTA inversión puntual, no todos los de la
  // empresa — para el combo de "Inversionista" del diálogo (movimientos de
  // tipo "venta") y para resolver el nombre en la tabla.
  const investors = allInvestors.filter((investor) => selectedInvestment?.investorIds.includes(investor.id));

  function propertyName(propertyId: string): string {
    return properties.find((property) => property.id === propertyId)?.name ?? '—';
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

  if (!investmentId) {
    return (
      <div>
        <h1 className="tipo-titulo-card mb-6">Mis inversiones</h1>
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Propiedad</th>
                  <th>Gestión</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {myInvestmentsLoading && (
                  <tr>
                    <td colSpan={3} className="data-table-empty">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!myInvestmentsLoading &&
                  myInvestments.map((investment) => (
                    <tr
                      key={investment.id}
                      onClick={() => setInvestmentId(investment.id)}
                      className="cursor-pointer"
                    >
                      <td>{propertyName(investment.propertyId)}</td>
                      <td>{investment.gestion}</td>
                      <td>{investment.description}</td>
                    </tr>
                  ))}
                {!myInvestmentsLoading && myInvestments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="data-table-empty">
                      No participás como inversionista en ninguna inversión todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={myInvestmentsPage}
            pageSize={MY_INVESTMENTS_PAGE_SIZE}
            total={myInvestmentsTotal}
            totalPages={myInvestmentsTotalPages}
            onPageChange={setMyInvestmentsPage}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          shortcutPropertyId
            ? router.push(`/investments?gestion=${shortcutGestion ?? ''}&propertyId=${shortcutPropertyId}`)
            : setInvestmentId(null)
        }
        className="tipo-link mb-4 flex items-center gap-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        {shortcutPropertyId ? 'Volver a Inversiones' : 'Volver a Mis inversiones'}
      </button>
      <h1 className="tipo-titulo-card mb-6">
        Kardex{selectedInvestment ? ` — ${selectedInvestment.description} (${selectedInvestment.gestion})` : ''}
      </h1>
      <div className="card">
        <PageToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nuevo movimiento"
          placeholder="Buscar por detalle..."
        />
        <KardexTable
          entries={entries}
          investors={investors}
          loading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={openEdit}
          onDeactivate={setPendingDeactivate}
        />
        <Pagination
          page={entriesPage}
          pageSize={ENTRIES_PAGE_SIZE}
          total={entriesTotal}
          totalPages={entriesTotalPages}
          onPageChange={setEntriesPage}
        />
      </div>

      <KardexEntryDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        entry={dialog.entry}
        investors={investors}
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
