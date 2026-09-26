'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/company/use-companies';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { usePermission } from '@/hooks/menu/use-permission';
import type { Company } from '@/domain/company/company.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CompanyTable } from '@/components/company/company-table';
import { CompanyDialog } from '@/components/company/company-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'companies';

const PAGE_SIZE = 10;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  company: Company | null;
  /** Cambia en cada apertura — fuerza el remount del diálogo (vía `key`) para
   * que el formulario arranque limpio incluso al abrir "Nueva empresa" dos
   * veces seguidas (mismo mode/company === null ambas veces). */
  sessionId: number;
}

export default function CompaniesPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <CompaniesPageContent />
    </RequirePermission>
  );
}

function CompaniesPageContent() {
  const { companies, isLoading, createCompany, updateCompany, deactivateCompany, uploadCompanyLogo, removeCompanyLogo } =
    useCompanies();
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    company: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Company | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const { page, setPage, totalPages, pageItems, total } = useClientPagination(filtered, PAGE_SIZE);

  function handleSearchChange(value: string): void {
    setSearch(value);
    setPage(1);
  }

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', company: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(company: Company): void {
    setDialog((prev) => ({ open: true, mode: 'edit', company, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: { name: string }): Promise<void> {
    if (dialog.mode === 'create') {
      await createCompany(data);
    } else if (dialog.company) {
      await updateCompany(dialog.company.id, data);
    }
  }

  // `dialog.company` solo puede ser `null` en modo "create" — el diálogo no
  // muestra la sección de logo en ese modo (ver `CompanyDialog`), así que
  // estas dos nunca se llaman sin un id real.
  async function handleUploadLogo(file: File): Promise<Company> {
    return uploadCompanyLogo(dialog.company!.id, file);
  }

  async function handleRemoveLogo(): Promise<Company> {
    return removeCompanyLogo(dialog.company!.id);
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const company = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateCompany(company.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar la empresa');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Empresas</h1>
      <div className="card">
        <PageToolbar
          search={search}
          onSearchChange={handleSearchChange}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nueva empresa"
          placeholder="Buscar por nombre..."
        />
        <CompanyTable
          companies={pageItems}
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

      <CompanyDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        company={dialog.company}
        onClose={closeDialog}
        onSave={handleSave}
        onUploadLogo={handleUploadLogo}
        onRemoveLogo={handleRemoveLogo}
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
