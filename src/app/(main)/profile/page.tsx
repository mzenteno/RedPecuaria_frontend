'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useMyProfile } from '@/hooks/user/use-my-profile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const profileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmNewPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * "Mi perfil" — sin `RequirePermission` (mismo criterio que `/dashboard`):
 * no es un módulo de negocio con permiso por rol, es una acción disponible
 * para cualquier usuario logueado sobre sí mismo. `MainLayout` ya exige
 * sesión activa, no hace falta ningún guard extra acá.
 */
export default function ProfilePage() {
  const { profile, updateProfile, isSavingProfile, changePassword, isChangingPassword } = useMyProfile();

  return (
    <div>
      <h1 className="tipo-titulo-card mb-6">Mi perfil</h1>
      <div className="flex flex-col gap-6">
        <ProfileCard
          username={profile.username}
          fullName={profile.fullName}
          email={profile.email}
          saving={isSavingProfile}
          onSave={updateProfile}
        />
        <PasswordCard saving={isChangingPassword} onSave={changePassword} />
      </div>
    </div>
  );
}

function ProfileCard({
  username,
  fullName,
  email,
  saving,
  onSave,
}: {
  username: string;
  fullName: string;
  email: string;
  saving: boolean;
  onSave: (data: ProfileFormData) => Promise<unknown>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    // `values` (no `defaultValues`): `fullName`/`email` arrancan vacíos y
    // llegan recién cuando `useMyProfile` lee el token — mismo motivo que
    // `EditUserForm` (ver `user-dialog.tsx`), el formulario se resincroniza
    // solo apenas hay datos, sin `reset()` manual.
    values: { fullName, email },
  });

  async function submit(data: ProfileFormData): Promise<void> {
    setError(null);
    setSuccess(false);
    try {
      await onSave(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el perfil');
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="tipo-titulo-seccion">Datos personales</h2>
        <p className="tipo-secundario">Tu nombre y correo, visibles para el resto de la empresa.</p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input label="Usuario" value={username} disabled title="El usuario de login no se puede cambiar" />
          <Input label="Nombre completo" autoComplete="off" error={errors.fullName?.message} {...register('fullName')} />
          <Input
            label="Email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {error && <p className="tipo-error">{error}</p>}
        {success && !error && <p className="tipo-success">Datos guardados correctamente.</p>}

        <div className="flex justify-end">
          <Button type="submit" loading={saving} className="min-w-28">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}

function PasswordCard({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  async function submit(data: PasswordFormData): Promise<void> {
    setError(null);
    setSuccess(false);
    try {
      await onSave({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      // A diferencia de `ProfileCard` (los valores siguen siendo válidos
      // para mostrar), acá no tiene sentido dejar la contraseña actual ni
      // la nueva escritas en pantalla después de guardarlas con éxito.
      reset();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cambiar la contraseña');
    }
  }

  const passwordType = showPasswords ? 'text' : 'password';
  const toggleButton = (
    <button
      type="button"
      onClick={() => setShowPasswords((value) => !value)}
      tabIndex={-1}
      aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
      className="hover:opacity-70"
      style={{ color: 'var(--foreground)' }}
    >
      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );

  return (
    <div className="card p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="tipo-titulo-seccion">Cambiar contraseña</h2>
        <p className="tipo-secundario">Necesitás tu contraseña actual para poder cambiarla.</p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Contraseña actual"
            type={passwordType}
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            rightElement={toggleButton}
            {...register('currentPassword')}
          />
          <Input
            label="Nueva contraseña"
            type={passwordType}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            rightElement={toggleButton}
            {...register('newPassword')}
          />
          <Input
            label="Confirmar nueva contraseña"
            type={passwordType}
            autoComplete="new-password"
            error={errors.confirmNewPassword?.message}
            rightElement={toggleButton}
            {...register('confirmNewPassword')}
          />
        </div>

        {error && <p className="tipo-error">{error}</p>}
        {success && !error && <p className="tipo-success">Contraseña actualizada correctamente.</p>}

        <div className="flex justify-end">
          <Button type="submit" loading={saving} className="min-w-28">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
