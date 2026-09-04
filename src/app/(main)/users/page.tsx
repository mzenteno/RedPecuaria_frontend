'use client';

import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/user/use-users';
import { useUserTypes } from '@/hooks/user-type/use-user-types';
import { usePermission } from '@/hooks/menu/use-permission';
import type { User } from '@/domain/user/user.entity';
import type { CreateUserData, UpdateUserData } from '@/domain/user/user.entity';
import { PageToolbar } from '@/components/ui/page-toolbar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserTable } from '@/components/user/user-table';
import { UserDialog } from '@/components/user/user-dialog';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'users';
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  user: User | null;
  /** Mismo motivo que en `CompanyDialog`: fuerza el remount del diálogo al
   * abrir "Nuevo usuario" dos veces seguidas. */
  sessionId: number;
}

export default function UsersPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <UsersPageContent />
    </RequirePermission>
  );
}

function UsersPageContent() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Búsqueda de servidor: a diferencia de "Empresas" (filtra un array ya
  // descargado), acá cada tecleo dispararía un `GET /users?search=` nuevo —
  // el debounce evita mandar un request por letra.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { users, isLoading, total, totalPages, createUser, updateUser, deactivateUser } = useUsers(
    page,
    PAGE_SIZE,
    search,
  );
  const { canCreate, canEdit, canDelete } = usePermission(MENU_KEY);
  const { data: userTypes = [] } = useUserTypes();

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    mode: 'create',
    user: null,
    sessionId: 0,
  });
  const [pendingDeactivate, setPendingDeactivate] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function openCreate(): void {
    setDialog((prev) => ({ open: true, mode: 'create', user: null, sessionId: prev.sessionId + 1 }));
  }

  function openEdit(user: User): void {
    setDialog((prev) => ({ open: true, mode: 'edit', user, sessionId: prev.sessionId + 1 }));
  }

  function closeDialog(): void {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(data: CreateUserData | UpdateUserData): Promise<void> {
    if (dialog.mode === 'create') {
      await createUser(data as CreateUserData);
    } else if (dialog.user) {
      await updateUser(dialog.user.id, data as UpdateUserData);
    }
  }

  async function confirmDeactivate(): Promise<void> {
    if (!pendingDeactivate) return;
    const user = pendingDeactivate;
    setPendingDeactivate(null);
    try {
      await deactivateUser(user.id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al eliminar el usuario');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Usuarios</h1>
      <div className="card">
        <PageToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          onNew={canCreate ? openCreate : undefined}
          newLabel="Nuevo usuario"
          placeholder="Buscar por usuario, email o nombre..."
        />
        <UserTable
          users={users}
          userTypes={userTypes}
          loading={isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={openEdit}
          onDeactivate={setPendingDeactivate}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <UserDialog
        key={dialog.sessionId}
        open={dialog.open}
        mode={dialog.mode}
        user={dialog.user}
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
