'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { useMyInvestments } from '@/hooks/investment/use-my-investments';
import { useInvestmentById } from '@/hooks/investment/use-investment-by-id';
import { useKardexEntries } from '@/hooks/kardex/use-kardex-entries';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { useCompanies } from '@/hooks/company/use-companies';
import { usePermission } from '@/hooks/menu/use-permission';
import { useActiveCompanyId } from '@/hooks/menu/use-active-company-id';
import type { KardexEntryFields, KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { KardexTable } from '@/components/kardex/kardex-table';
import { KardexEntryDialog } from '@/components/kardex/kardex-entry-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';
import { listKardexEntriesByInvestmentUseCase } from '@/infrastructure/di/kardex.container';
import { downloadKardexPdf } from '@/lib/kardex-pdf';
import { formatNumber } from '@/lib/format-number';

// Menú propio, independiente de "Inversiones" (§14 de ARCHITECTURE.md): un
// rol puede tener acceso a Kardex sin tener acceso al CRUD de Inversiones
// (o viceversa). Pantalla de nivel superior en el sidebar, no un drill-down.
const MENU_KEY = 'kardex';
const MY_INVESTMENTS_PAGE_SIZE = 10;
const ENTRIES_PAGE_SIZE = 20;
// El PDF necesita el historial COMPLETO, no la página que se ve en
// pantalla — pero `pageSize` tiene un tope de 100 en el backend
// (`ListKardexEntriesQueryDto`, mismo criterio en todos los listados
// paginados de la app), así que se trae en varias vueltas de a 100 en vez
// de pedir todo de una (ver `fetchAllKardexEntries`).
const PDF_FETCH_PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntryListItem | null;
  sessionId: number;
}

/** Trae TODAS las filas activas de una inversión, en vueltas de
 * `PDF_FETCH_PAGE_SIZE` — solo para el PDF (la pantalla sigue paginada de
 * verdad con `ENTRIES_PAGE_SIZE`). */
async function fetchAllKardexEntries(investmentId: string): Promise<KardexEntryListItem[]> {
  const items: KardexEntryListItem[] = [];
  let page = 1;
  while (true) {
    const result = await listKardexEntriesByInvestmentUseCase.execute({
      investmentId,
      page,
      pageSize: PDF_FETCH_PAGE_SIZE,
    });
    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) {
      break;
    }
    page += 1;
  }
  return items;
}

export default function KardexPage() {
  const searchParams = useSearchParams();
  // Ir de "/kardex?investmentId=&..." (atajo) a
  // "/kardex" (clic directo en el ítem del sidebar) es la MISMA ruta — Next
  // no remonta el componente solo porque cambia el query string, así que el
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
  // Atajo desde la tabla de Inversiones ("Ver kardex"): llega con
  // `investmentId` (el id de ESA inversión puntual) más TODOS los filtros
  // que tenía activos la pantalla de Inversiones (`gestion`/`propertyId`/
  // `investorUserId`/`search`/`page`, con esos mismos nombres). `returnQuery`
  // es esa misma URL de llegada, sin el primero — así "Volver a Inversiones"
  // restaura EXACTAMENTE los filtros que había antes, en vez de inventar
  // unos nuevos a partir de la inversión puntual que se abrió (bug real:
  // antes reusaba la propiedad de esa inversión como si fuera el filtro de
  // Propiedad que tenía la pantalla, aunque no hubiera ninguno elegido).
  //
  // Todos los datos de la inversión (propiedad, gestión, descripción,
  // inversionistas, saldo) salen de `useInvestmentById(investmentId)` más
  // abajo — un solo `GET /investments/:id`, no hace falta pedir la lista
  // completa de una propiedad para buscar adentro la fila puntual (bug
  // real, ver el change de este cambio).
  const [isShortcut] = useState<boolean>(() => searchParams.get('investmentId') !== null);
  const [investmentId, setInvestmentId] = useState<string | null>(() => searchParams.get('investmentId'));
  const [returnQuery] = useState<string>(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('investmentId');
    return params.toString();
  });
  const [myInvestmentsPage, setMyInvestmentsPage] = useState(1);

  const {
    investments: myInvestments,
    total: myInvestmentsTotal,
    totalPages: myInvestmentsTotalPages,
    isLoading: myInvestmentsLoading,
  } = useMyInvestments(myInvestmentsPage, MY_INVESTMENTS_PAGE_SIZE, investmentId === null);
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { investors: allInvestors } = useInvestorUsers();
  // Logo de la empresa activa, para el encabezado del PDF (ver
  // `docs/company/changes/2026-09-26-logo-de-empresa.md`) — `useCompanies()`
  // ya devuelve solo la empresa propia si quien mira no es Super
  // Administrador, así que este `find` no expone logos de otras empresas.
  const { companies } = useCompanies();
  const activeCompanyId = useActiveCompanyId();
  const companyLogoUrl = companies.find((c) => c.id === activeCompanyId)?.logoUrl ?? null;
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
    totalDebe,
    totalHaber,
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
  const [pendingDeactivate, setPendingDeactivate] = useState<KardexEntryListItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Único fetch para toda la inversión puntual (propiedad, gestión,
  // descripción, inversionistas, saldo) — `GET /investments/:id`, mismo
  // criterio que `useUserById`. `myInvestments` (arriba) sigue existiendo
  // solo para la pantalla "Mis inversiones" (elegir con cuál entrar), no
  // para resolver esto.
  const { data: investmentDetail } = useInvestmentById(investmentId);
  // Solo los inversionistas de ESTA inversión puntual, no todos los de la
  // empresa — para el combo de "Inversionista" del diálogo (movimientos de
  // tipo "venta") y para resolver el nombre en la tabla.
  const investors = allInvestors.filter((investor) => investmentDetail?.investorIds.includes(investor.id));

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', entry: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(entry: KardexEntryListItem): void {
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

  async function handleDownloadPdf(): Promise<void> {
    if (!investmentId || !investmentDetail) return;
    setDownloadingPdf(true);
    try {
      // Ignora la paginación de pantalla — trae el historial activo
      // completo para que el PDF no salga cortado en 20 filas.
      const allEntries = await fetchAllKardexEntries(investmentId);
      await downloadKardexPdf({
        propertyName: investmentDetail.propertyName,
        investmentDescription: investmentDetail.description,
        gestion: investmentDetail.gestion,
        investmentTypeName: investmentDetail.investmentTypeName,
        investors,
        entries: allEntries,
        companyLogoUrl,
      });
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al generar el PDF');
    } finally {
      setDownloadingPdf(false);
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
                      <td>{investment.propertyName}</td>
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
          isShortcut
            ? router.push(`/investments${returnQuery ? `?${returnQuery}` : ''}`)
            : setInvestmentId(null)
        }
        className="tipo-link mb-4 flex items-center gap-1 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        {isShortcut ? 'Volver a Inversiones' : 'Volver a Mis inversiones'}
      </button>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="tipo-titulo-card">
            Kardex{investmentDetail ? ` — ${investmentDetail.description} (${investmentDetail.gestion})` : ''}
          </h1>
          {investmentDetail && (
            <p className="tipo-secundario">
              Saldo actual: {investmentDetail.balanceQuantity} cabezas ·{' '}
              {investmentDetail.investmentTypeName === 'dinero'
                ? `${formatNumber(investmentDetail.total)} Bs.`
                : `${formatNumber(investmentDetail.balanceKilos)} kg`}
            </p>
          )}
        </div>
        {investmentDetail && (
          <Button type="button" variant="secondary" onClick={handleDownloadPdf} loading={downloadingPdf} className="shrink-0">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Descargar PDF
          </Button>
        )}
      </div>
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
          investmentTypeName={investmentDetail?.investmentTypeName ?? 'kilo'}
          totalDebe={totalDebe}
          totalHaber={totalHaber}
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
        investmentTypeName={investmentDetail?.investmentTypeName ?? 'kilo'}
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
