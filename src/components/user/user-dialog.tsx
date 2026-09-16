'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import type { UserListItem, CreateUserData, UpdateUserData } from '@/domain/user/user.entity';
import { useRoles } from '@/hooks/role/use-roles';
import { useUserTypes } from '@/hooks/user-type/use-user-types';
import { useUserById } from '@/hooks/user/use-user-by-id';
import { useUserRole } from '@/hooks/user-company/use-user-role';
import { changeUserTypeUseCase } from '@/infrastructure/di/user.container';
import { changeUserRoleUseCase } from '@/infrastructure/di/user-company.container';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const createUserSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  userTypeId: z.string().min(1, 'Selecciona un tipo de usuario'),
  roleId: z.string().min(1, 'Selecciona un rol'),
});

const editUserSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  userTypeId: z.string().min(1, 'Selecciona un tipo de usuario'),
  roleId: z.string().min(1, 'Selecciona un rol'),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type EditFormData = z.infer<typeof editUserSchema>;

interface UserDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  user: UserListItem | null;
  onClose: () => void;
  onSave: (data: CreateUserData | UpdateUserData) => Promise<void>;
}

/**
 * Igual estructura que `CompanyDialog` (`.dialog-overlay`/`.dialog-panel`,
 * `gap-8`, footer con Cancelar/Guardar), pero el alta y la edición tienen
 * formularios realmente distintos (username/password/empresa/rol solo
 * existen al crear, ver `UpdateUserUseCase` del backend) — separados en dos
 * componentes internos en vez de forzar un único formulario con campos
 * condicionales.
 */
export function UserDialog({ open, mode, user, onClose, onSave }: UserDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel dialog-panel-lg flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</h2>
          <p className="tipo-secundario">
            {mode === 'create'
              ? 'Completa los datos del nuevo usuario.'
              : 'Modifica los datos del usuario.'}
          </p>
        </div>

        {mode === 'create' ? (
          <CreateUserForm onClose={onClose} onSave={onSave} />
        ) : (
          <EditUserForm user={user} onClose={onClose} onSave={onSave} />
        )}
      </div>
    </div>
  );
}

function CreateUserForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: CreateUserData) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // El alta siempre es sobre la empresa activa de la sesión (fija para un
  // usuario normal, la que haya elegido un Super Administrador en el
  // `CompanySwitcher`) — no se vuelve a elegir acá, ver `CreateUserData`.
  // `useRoles()` ya lista solo los de esa empresa (el backend la resuelve
  // por sesión, no por parámetro).
  const { roles } = useRoles();
  const { data: userTypes } = useUserTypes();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { roleId: '', userTypeId: '' },
  });

  async function submit(data: CreateFormData): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Input
          label="Usuario"
          placeholder="usuario"
          autoFocus
          autoComplete="off"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input label="Nombre completo" placeholder="Nombre y apellido" error={errors.fullName?.message} {...register('fullName')} />
        <Input
          label="Email"
          type="email"
          placeholder="usuario@empresa.com"
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="hover:opacity-70"
              style={{ color: 'var(--foreground)' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          {...register('password')}
        />
        <Select
          label="Tipo de usuario"
          error={errors.userTypeId?.message}
          defaultValue=""
          {...register('userTypeId')}
        >
          {userTypes?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
        <Select label="Rol" error={errors.roleId?.message} defaultValue="" {...register('roleId')}>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="tipo-error">{error}</p>}

      <div className="dialog-footer">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function EditUserForm({
  user,
  onClose,
  onSave,
}: {
  user: UserListItem | null;
  onClose: () => void;
  onSave: (data: UpdateUserData) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { roles } = useRoles();
  const { data: userTypes } = useUserTypes();
  // El listado (`UserListItem`) es liviano a propósito (solo lo que se
  // muestra en la tabla, ver `docs/user/changes/...`) — el formulario NUNCA
  // debe leer sus campos como si fueran el detalle completo. `user` (la fila
  // clickeada) solo se usa para saber CUÁL id editar; todo lo demás
  // (`email`, `fullName`, `userTypeId`) sale de `GET /users/:id`, igual que
  // el rol sale de `GET /users/:id/role` vía `useUserRole`.
  const { data: userDetail, isLoading: userDetailLoading } = useUserById(user?.id ?? null);
  const { data: userCompany, isLoading: userCompanyLoading } = useUserRole(user?.id ?? null);
  const loadingDetail = userDetailLoading || userCompanyLoading;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editUserSchema),
    // `values` (no `defaultValues`): el detalle y el rol llegan después del
    // primer render (`useUserById`/`useUserRole` son async) — con `values`
    // el formulario se resincroniza solo apenas llegan, sin `reset()` manual.
    values: {
      email: userDetail?.email ?? '',
      fullName: userDetail?.fullName ?? '',
      userTypeId: userDetail?.userTypeId ?? '',
      roleId: userCompany?.roleId ?? '',
    },
  });

  async function submit(data: EditFormData): Promise<void> {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ email: data.email, fullName: data.fullName });
      // Acciones separadas del backend (ver `docs/user/user.md`) — solo se
      // llaman si de verdad cambiaron, para no upsertear sin necesidad.
      if (data.userTypeId !== userDetail?.userTypeId) {
        await changeUserTypeUseCase.execute(user.id, data.userTypeId);
      }
      if (userCompany && data.roleId !== userCompany.roleId) {
        await changeUserRoleUseCase.execute(userCompany.id, data.roleId);
      }
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['user-role', user.id] });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Input
          label="Usuario"
          value={userDetail?.username ?? ''}
          disabled
          title="El usuario de login no se puede cambiar"
        />
        <Input
          label="Nombre completo"
          autoFocus
          disabled={loadingDetail}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          disabled={loadingDetail}
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Tipo de usuario"
          error={errors.userTypeId?.message}
          disabled={loadingDetail}
          {...register('userTypeId')}
        >
          {userTypes?.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
        <Select
          label="Rol"
          error={errors.roleId?.message}
          disabled={loadingDetail}
          {...register('roleId')}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
      </div>

      {error && <p className="tipo-error">{error}</p>}

      <div className="dialog-footer">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving} disabled={loadingDetail}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
