'use client';

import { useState } from 'react';
import { useRoles } from '@/hooks/role/use-roles';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { usePermission } from '@/hooks/menu/use-permission';
import type { Role } from '@/domain/role/role.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoleTable } from '@/components/role/role-table';
import { RoleDialog } from '@/components/role/role-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'roles';
const PAGE_SIZE = 10;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  role: Role | null;
  /** Fuerza el remount del diálogo al abrir "Nuevo rol" dos veces seguidas —
   * mismo motivo que en `CompanyDialog`. */
  sessionId: number;
}

export default function RolesPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <RolesPageContent />
    </RequirePermission>
  );
}

function RolesPageContent() {
  const { roles, isLoading, createRole, updateRole, deactivateRole } = useRoles();
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    role: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<Role | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const { page, setPage, totalPages, pageItems, total } = useClientPagination(filtered, PAGE_SIZE);

  function handleSearchChange(value: string): void {
    setSearch(value);
    setPage(1);
  }

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', role: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(role: Role): void {
    setDialog((prev) => ({ open: true, mode: 'edit', role, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: { name: string }): Promise<void> {
    if (dialog.mode === 'create') {
      await createRole(data);
    } else if (dialog.role) {
      await updateRole(dialog.role.id, data);
    }
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const role = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateRole(role.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar el rol');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Roles</h1>
      <div className="card">
        <PageToolbar
          search={search}
          onSearchChange={handleSearchChange}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nuevo rol"
          placeholder="Buscar por nombre..."
        />
        <RoleTable
          roles={pageItems}
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

      <RoleDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        role={dialog.role}
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
