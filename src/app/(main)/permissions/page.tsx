'use client';

import { useState } from 'react';
import { useRoles } from '@/hooks/role/use-roles';
import { useRolePermissions, type MenuPermissionRow } from '@/hooks/permission/use-role-permissions';
import { usePermission } from '@/hooks/menu/use-permission';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PermissionMatrix } from '@/components/permission/permission-matrix';
import { RequirePermission } from '@/components/auth/require-permission';
import { ApiError } from '@/infrastructure/http/http-client';

const MENU_KEY = 'permissions';

type PermissionField = 'canView' | 'canCreate' | 'canEdit' | 'canDelete';

export default function PermissionsPage() {
  return (
    <RequirePermission menuKey={MENU_KEY}>
      <PermissionsPageContent />
    </RequirePermission>
  );
}

function PermissionsPageContent() {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { canEdit } = usePermission(MENU_KEY);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { rows, isLoading, setPermission } = useRolePermissions(roleId);

  async function handleToggle(row: MenuPermissionRow, field: PermissionField): Promise<void> {
    try {
      await setPermission(row.menuId, {
        canView: row.canView,
        canCreate: row.canCreate,
        canEdit: row.canEdit,
        canDelete: row.canDelete,
        [field]: !row[field],
      });
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Error al guardar el permiso');
    }
  }

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Permisos</h1>
      <div className="card">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-xs">
            <Select
              label="Rol"
              value={roleId ?? ''}
              disabled={rolesLoading}
              onChange={(e) => setRoleId(e.target.value || null)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {roleId ? (
          <PermissionMatrix rows={rows} loading={isLoading} readOnly={!canEdit} onToggle={handleToggle} />
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="tipo-muted">Selecciona un rol para ver y editar sus permisos.</span>
          </div>
        )}
      </div>

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
