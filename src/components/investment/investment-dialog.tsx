'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { InvestmentListItem } from '@/domain/investment/investment.entity';
import { useInvestorUsers } from '@/hooks/user/use-investor-users';
import { usePropertyOptions } from '@/hooks/property/use-property-options';
import { useInvestmentById } from '@/hooks/investment/use-investment-by-id';
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
  // 'false'/'true' como string (mismo criterio que `gestion`) — solo se
  // muestra/edita en modo edición, ver el combo "Estado" más abajo.
  isFinished: z.string(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface InvestmentDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  investment: InvestmentListItem | null;
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
    isFinished: boolean;
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
 *
 * "Estado" (Activa/Terminada) solo se muestra en edición — una inversión
 * recién creada siempre arranca activa, no tiene sentido elegirlo al
 * alta. Es una elección manual del usuario, no se deriva del saldo: la
 * idea de uso es marcarla como Terminada cuando `balanceQuantity` llegue a
 * 0, pero nada lo fuerza (ver docs/investment/investment.md del backend).
 *
 * En edición, `investment` (la fila de la lista, a propósito liviana —
 * ver `InvestmentListItem`) solo se usa para saber QUÉ id editar. Todos
 * los valores del formulario salen de `useInvestmentById`, nunca de esa
 * fila — mismo criterio que `UserDialog`/`useUserById`: el diálogo de
 * edición no depende del listado, pide el detalle completo por id.
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
  const [investorIds, setInvestorIds] = useState<string[]>([]);
  const { investors, isLoading: investorsLoading } = useInvestorUsers();
  const { properties, isLoading: propertiesLoading } = usePropertyOptions();
  const { data: investmentDetail, isLoading: investmentDetailLoading } = useInvestmentById(
    mode === 'edit' ? (investment?.id ?? null) : null,
  );
  const loadingDetail = mode === 'edit' && investmentDetailLoading;

  // Para saber si ya se sincronizó `investorIds` con el detalle que llegó
  // (async) — sin esto, cada re-render volvería a pisar lo que el usuario
  // ya tildó/destildó a mano. Ajuste de estado durante el render (patrón
  // recomendado por React para "resetear estado cuando cambia una prop/
  // dato externo"), no un efecto — evita el render en cascada.
  const [investorIdsLoadedFor, setInvestorIdsLoadedFor] = useState<string | null>(null);
  if (mode === 'edit' && investmentDetail && investorIdsLoadedFor !== investmentDetail.id) {
    setInvestorIdsLoadedFor(investmentDetail.id);
    setInvestorIds(investmentDetail.investorIds);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    // `values` (no `defaultValues`): el detalle llega después del primer
    // render (`useInvestmentById` es async) — con `values` el formulario se
    // resincroniza solo apenas llega, sin `reset()` manual (mismo criterio
    // que `EditUserForm`).
    values: {
      propertyId: mode === 'edit' ? (investmentDetail?.propertyId ?? '') : (defaultPropertyId ?? ''),
      gestion: mode === 'edit' ? (investmentDetail ? String(investmentDetail.gestion) : '') : '',
      description: mode === 'edit' ? (investmentDetail?.description ?? '') : '',
      // Una inversión recién creada siempre arranca activa — el combo
      // "Estado" ni se muestra en modo alta.
      isFinished: mode === 'edit' && investmentDetail ? String(investmentDetail.isFinished) : 'false',
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
        isFinished: data.isFinished === 'true',
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
              disabled={propertiesLoading || loadingDetail}
              {...register('propertyId')}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>

            <Select
              label="Gestión"
              error={errors.gestion?.message}
              disabled={loadingDetail}
              {...register('gestion')}
            >
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
              disabled={loadingDetail}
              error={errors.description?.message}
              {...register('description')}
            />

            {mode === 'edit' && (
              <Select label="Estado" error={errors.isFinished?.message} disabled={loadingDetail} {...register('isFinished')}>
                <option value="false">Activa</option>
                <option value="true">Terminada</option>
              </Select>
            )}

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
            <Button type="submit" loading={saving} disabled={loadingDetail}>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
