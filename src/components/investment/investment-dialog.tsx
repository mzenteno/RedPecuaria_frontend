'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Investment } from '@/domain/investment/investment.entity';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePropertyOptions } from '@/hooks/property/use-property-options';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const CURRENT_YEAR = new Date().getFullYear();
// Del año que viene hasta 6 para atrás — cubre gestiones recientes sin
// tener que mantener la lista a mano cada año.
const GESTION_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 1 - i);

const investmentSchema = z.object({
  propertyId: z.string().min(1, 'Selecciona una propiedad'),
  gestion: z.string().min(1, 'Selecciona una gestión'),
  description: z.string().min(1, 'La descripción es obligatoria'),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface InvestmentDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  investment: Investment | null;
  /** Solo se usa en el alta — si la pantalla ya tiene una Propiedad elegida
   * en su combo de filtro, conviene precargar ese mismo valor acá en vez de
   * arrancar vacío (evita elegir la misma propiedad dos veces). Sigue
   * siendo editable, no es un valor fijo. */
  defaultPropertyId?: string | null;
  onClose: () => void;
  onSave: (data: {
    propertyId: string;
    gestion: number;
    description: string;
    investorUserIds: string[];
  }) => Promise<void>;
}

/**
 * `propertyId` vive acá adentro, no en la pantalla que lo abre — antes
 * dependía de que `app/(main)/investments` ya tuviera una Propiedad elegida
 * en su combo de filtro (que ahora puede estar vacío sin que eso impida
 * crear una inversión, ver `frontend/ARCHITECTURE.md` §14). Editable tanto
 * en el alta como en la edición — a diferencia de otros campos "de
 * identidad" del proyecto (`username` en `UserDialog`), no hay ninguna
 * regla de negocio que impida "mudar" una inversión a otra propiedad de la
 * misma empresa (`UpdateInvestmentUseCase` valida que la nueva propiedad
 * sea de la empresa activa).
 */
export function InvestmentDialog({
  open,
  mode,
  investment,
  defaultPropertyId,
  onClose,
  onSave,
}: InvestmentDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investorIds, setInvestorIds] = useState<string[]>(investment?.investorIds ?? []);
  const { investors, isLoading: investorsLoading } = useInvestorUsers();
  const { properties, isLoading: propertiesLoading } = usePropertyOptions();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      propertyId: mode === 'edit' && investment ? investment.propertyId : (defaultPropertyId ?? ''),
      gestion: mode === 'edit' && investment ? String(investment.gestion) : '',
      description: mode === 'edit' ? (investment?.description ?? '') : '',
    },
  });

  function toggleInvestor(userId: string): void {
    setInvestorIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  async function submit(data: InvestmentFormData): Promise<void> {
    if (investorIds.length === 0) {
      setError('Selecciona al menos un inversionista');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        propertyId: data.propertyId,
        gestion: Number(data.gestion),
        description: data.description,
        investorUserIds: investorIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar la inversión');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel dialog-panel-lg flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nueva inversión' : 'Editar inversión'}</h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa los datos de la nueva inversión.' : 'Modifica los datos de la inversión.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Select
              label="Propiedad"
              error={errors.propertyId?.message}
              disabled={propertiesLoading}
              {...register('propertyId')}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>

            <Select label="Gestión" error={errors.gestion?.message} {...register('gestion')}>
              {GESTION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <Input
              label="Descripción"
              placeholder="Ej. Torillos"
              autoFocus
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex flex-col gap-1">
              <label className="tipo-label">Inversionistas</label>
              <div
                className="flex max-h-40 flex-col gap-2 overflow-y-auto border p-3"
                style={{ borderColor: 'var(--border-input)' }}
              >
                {investorsLoading && <span className="tipo-muted">Cargando...</span>}
                {!investorsLoading && investors.length === 0 && (
                  <span className="tipo-muted">No hay usuarios de tipo Inversionista todavía.</span>
                )}
                {investors.map((investor) => (
                  <label key={investor.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={investorIds.includes(investor.id)}
                      onChange={() => toggleInvestor(investor.id)}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                    <span className="tipo-normal">{investor.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
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
      </div>
    </div>
  );
}
