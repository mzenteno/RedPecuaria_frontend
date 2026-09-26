'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import type { Company } from '@/domain/company/company.entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const companySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

type CompanyFormData = z.infer<typeof companySchema>;

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

interface CompanyDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  company: Company | null;
  onClose: () => void;
  onSave: (data: CompanyFormData) => Promise<void>;
  onUploadLogo: (file: File) => Promise<Company>;
  onRemoveLogo: () => Promise<Company>;
}

export function CompanyDialog({
  open,
  mode,
  company,
  onClose,
  onSave,
  onUploadLogo,
  onRemoveLogo,
}: CompanyDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Estado propio, no derivado de `company` en cada render — subir/quitar
  // el logo es una acción independiente del "Guardar" del formulario (ver
  // por qué más abajo), así que necesita su resultado aparte para
  // refrescar la vista previa sin depender de que el listado ya se haya
  // vuelto a pedir.
  const [logoUrl, setLogoUrl] = useState<string | null>(company?.logoUrl ?? null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo archivo más adelante (ej. después de
    // quitarlo) — sin esto, `onChange` no se dispara una segunda vez con el
    // mismo path.
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError('El logo debe ser una imagen PNG, JPG, WEBP o SVG');
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError('El logo no puede pesar más de 2 MB');
      return;
    }

    setLogoSaving(true);
    setLogoError(null);
    try {
      const updated = await onUploadLogo(file);
      setLogoUrl(updated.logoUrl);
    } catch (err) {
      setLogoError(err instanceof ApiError ? err.message : 'Error al subir el logo');
    } finally {
      setLogoSaving(false);
    }
  }

  async function handleRemoveLogo(): Promise<void> {
    setLogoSaving(true);
    setLogoError(null);
    try {
      const updated = await onRemoveLogo();
      setLogoUrl(updated.logoUrl);
    } catch (err) {
      setLogoError(err instanceof ApiError ? err.message : 'Error al quitar el logo');
    } finally {
      setLogoSaving(false);
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

          {/* Solo en edición — subir un logo antes de que la empresa exista
              no tiene a qué endpoint pegarle (`POST /companies/:id/logo`
              necesita un id real), mismo criterio que "Estado" en
              `InvestmentDialog`. Es una acción independiente del "Guardar"
              de acá arriba (sube apenas se elige el archivo, con su propio
              estado de carga/error) — no un campo más del formulario: así
              no hace falta encadenar "crear → recién ahí subir" ni dejar el
              archivo elegido "pendiente" si el usuario cierra sin guardar
              el nombre. */}
          {mode === 'edit' && (
            <div className="flex flex-col gap-2">
              <label className="tipo-label">Logo</label>
              <div className="flex flex-col items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL absoluta servida por el backend, no un asset propio del proyecto
                  <img
                    src={logoUrl}
                    alt="Logo de la empresa"
                    className="h-32 w-32 border object-contain p-1"
                    style={{ borderColor: 'var(--border-input)' }}
                  />
                ) : (
                  <div
                    className="flex h-32 w-32 items-center justify-center border"
                    style={{ borderColor: 'var(--border-input)' }}
                  >
                    <span className="tipo-muted">Sin logo</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      loading={logoSaving}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="flex items-center gap-2">
                        <Upload size={16} />
                        {logoUrl ? 'Cambiar' : 'Subir logo'}
                      </span>
                    </Button>
                    {logoUrl && (
                      <Button type="button" variant="secondary" disabled={logoSaving} onClick={handleRemoveLogo}>
                        <span className="flex items-center gap-2">
                          <X size={16} />
                          Quitar
                        </span>
                      </Button>
                    )}
                  </div>
                  {logoError && <p className="tipo-error">{logoError}</p>}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          )}

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
