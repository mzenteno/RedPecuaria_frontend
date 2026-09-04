'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Company } from '@/domain/company/company.entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const companySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  company: Company | null;
  onClose: () => void;
  onSave: (data: CompanyFormData) => Promise<void>;
}

export function CompanyDialog({ open, mode, company, onClose, onSave }: CompanyDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: mode === 'edit' ? (company?.name ?? '') : '' },
  });

  async function submit(data: CompanyFormData): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar la empresa');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">
            {mode === 'create' ? 'Nueva empresa' : 'Editar empresa'}
          </h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa el nombre de la nueva empresa.' : 'Modifica el nombre de la empresa.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <Input
            label="Nombre de la empresa"
            placeholder="Ej. Estancia El Progreso"
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
