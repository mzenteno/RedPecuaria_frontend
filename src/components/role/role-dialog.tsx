'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Role } from '@/domain/role/role.entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const roleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  role: Role | null;
  onClose: () => void;
  onSave: (data: RoleFormData) => Promise<void>;
}

/** Igual estructura que `CompanyDialog` — un solo campo, mismo `gap-8`,
 * mismo footer Cancelar/Guardar. */
export function RoleDialog({ open, mode, role, onClose, onSave }: RoleDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: mode === 'edit' ? (role?.name ?? '') : '' },
  });

  async function submit(data: RoleFormData): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el rol');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nuevo rol' : 'Editar rol'}</h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa el nombre del nuevo rol.' : 'Modifica el nombre del rol.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <Input
            label="Nombre del rol"
            placeholder="Ej. Operador"
            autoFocus
            error={errors.name?.message}
            {...register('name')}
          />

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
      </div>
    </div>
  );
}
