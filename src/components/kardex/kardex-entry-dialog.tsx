'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { KardexEntry, KardexEntryFields, KardexMovementType } from '@/domain/kardex/kardex-entry.entity';
import { KARDEX_MOVEMENT_TYPE_OPTIONS } from '@/domain/kardex/kardex-entry.entity';
import type { User } from '@/domain/user/user.entity';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

const numberField = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatorio`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} tiene que ser un número`);

const kardexEntrySchema = z
  .object({
    entryDate: z.string().min(1, 'La fecha es obligatoria'),
    detail: z.string().min(1, 'El detalle es obligatorio'),
    movementType: z.string().min(1, 'Selecciona un tipo de movimiento'),
    investorUserId: z.string().optional(),
    avgWeight: numberField('El peso promedio'),
    entryQuantity: numberField('La cantidad de entrada'),
    entryKilos: numberField('Los kilos de entrada'),
    exitQuantity: numberField('La cantidad de salida'),
    exitKilos: numberField('Los kilos de salida'),
    balanceQuantity: numberField('La cantidad de saldo'),
    balanceKilos: numberField('Los kilos de saldo'),
    total: numberField('El total'),
  })
  // Solo "venta" se atribuye a un inversionista puntual — ver
  // docs/investment/investment.md del backend ("Decisiones de alcance").
  .superRefine((data, ctx) => {
    if (data.movementType === 'venta' && !data.investorUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona un inversionista',
        path: ['investorUserId'],
      });
    }
  });

type KardexEntryFormData = z.infer<typeof kardexEntrySchema>;

interface KardexEntryDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntry | null;
  /** Inversionistas de la inversión activa (ya resueltos a nombre) — para
   * el combo que solo se muestra con `movementType === 'venta'`. */
  investors: User[];
  onClose: () => void;
  onSave: (data: KardexEntryFields) => Promise<void>;
}

function toFormValues(entry: KardexEntry | null): KardexEntryFormData {
  return {
    entryDate: entry?.entryDate ?? '',
    detail: entry?.detail ?? '',
    movementType: entry?.movementType ?? '',
    investorUserId: entry?.investorUserId ?? '',
    avgWeight: entry ? String(entry.avgWeight) : '',
    entryQuantity: entry ? String(entry.entryQuantity) : '0',
    entryKilos: entry ? String(entry.entryKilos) : '0',
    exitQuantity: entry ? String(entry.exitQuantity) : '0',
    exitKilos: entry ? String(entry.exitKilos) : '0',
    balanceQuantity: entry ? String(entry.balanceQuantity) : '0',
    balanceKilos: entry ? String(entry.balanceKilos) : '0',
    total: entry ? String(entry.total) : '0',
  };
}

/** Igual estructura que el resto de los diálogos, pero agrupando
 * Cantidad/Kilos de Entrada, Salida y Saldo de a pares — mismo
 * agrupamiento visual que la planilla de referencia
 * (docs/investment/investment.md), en vez de una columna larga de 10
 * campos sueltos.
 *
 * El "Tipo de movimiento" decide qué más se muestra: "Ingreso" pide
 * Entrada (cantidad/kilos), sin inversionista — es la carga general de
 * ganado a la inversión. "Venta" pide Salida + un inversionista puntual (a
 * quién se le atribuye esa venta). "Baja" pide Salida, sin inversionista —
 * es una pérdida/muerte, general como el ingreso. Saldo, Peso promedio y
 * Total se piden siempre, sea cual sea el tipo.
 */
export function KardexEntryDialog({ open, mode, entry, investors, onClose, onSave }: KardexEntryDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<KardexEntryFormData>({
    resolver: zodResolver(kardexEntrySchema),
    defaultValues: toFormValues(mode === 'edit' ? entry : null),
  });

  // `useWatch` (no `form.watch()`) — es un hook de verdad, compatible con
  // el React Compiler; `watch()` es una función de escape que lo desactiva
  // para todo el componente (ver warning de `react-hooks/incompatible-library`).
  const movementType = useWatch({ control, name: 'movementType' });
  const isIngreso = movementType === 'ingreso';
  const isVenta = movementType === 'venta';
  const isBaja = movementType === 'baja';

  // Cambiar de tipo descarta el inversionista elegido — evita mandar un
  // `investorUserId` viejo si se pasa de "venta" a otro tipo y se vuelve.
  useEffect(() => {
    if (!isVenta) {
      setValue('investorUserId', '');
    }
  }, [isVenta, setValue]);

  async function submit(data: KardexEntryFormData): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        entryDate: data.entryDate,
        detail: data.detail,
        movementType: data.movementType as KardexMovementType,
        investorUserId: data.movementType === 'venta' ? (data.investorUserId ?? null) : null,
        avgWeight: Number(data.avgWeight),
        entryQuantity: Number(data.entryQuantity),
        entryKilos: Number(data.entryKilos),
        exitQuantity: Number(data.exitQuantity),
        exitKilos: Number(data.exitKilos),
        balanceQuantity: Number(data.balanceQuantity),
        balanceKilos: Number(data.balanceKilos),
        total: Number(data.total),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el movimiento');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel flex flex-col gap-8" style={{ maxWidth: '32rem' }}>
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nuevo movimiento' : 'Editar movimiento'}</h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa los datos del nuevo movimiento de kardex.' : 'Modifica los datos del movimiento.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Input label="Fecha" type="date" error={errors.entryDate?.message} {...register('entryDate')} />
            <Input
              label="Detalle"
              placeholder="Ej. Ingreso de 208 torillos"
              autoFocus
              error={errors.detail?.message}
              {...register('detail')}
            />
            <Select label="Tipo de movimiento" error={errors.movementType?.message} {...register('movementType')}>
              {KARDEX_MOVEMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {isVenta && (
              <Select label="Inversionista" error={errors.investorUserId?.message} {...register('investorUserId')}>
                {investors.map((investor) => (
                  <option key={investor.id} value={investor.id}>
                    {investor.fullName}
                  </option>
                ))}
              </Select>
            )}

            <Input label="Peso promedio" type="number" step="0.01" error={errors.avgWeight?.message} {...register('avgWeight')} />

            {isIngreso && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entrada — cantidad" type="number" error={errors.entryQuantity?.message} {...register('entryQuantity')} />
                <Input label="Entrada — kilos" type="number" step="0.01" error={errors.entryKilos?.message} {...register('entryKilos')} />
              </div>
            )}

            {(isVenta || isBaja) && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Salida — cantidad" type="number" error={errors.exitQuantity?.message} {...register('exitQuantity')} />
                <Input label="Salida — kilos" type="number" step="0.01" error={errors.exitKilos?.message} {...register('exitKilos')} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Saldo — cantidad" type="number" error={errors.balanceQuantity?.message} {...register('balanceQuantity')} />
              <Input label="Saldo — kilos" type="number" step="0.01" error={errors.balanceKilos?.message} {...register('balanceKilos')} />
            </div>

            <Input label="Total" type="number" step="0.01" error={errors.total?.message} {...register('total')} />
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
