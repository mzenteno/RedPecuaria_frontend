'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { KardexEntry, KardexEntryFields, KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import type { UserOption } from '@/domain/user/user.entity';
import { useMovementTypes } from '@/hooks/movement-type/use-movement-types';
import { useKardexEntryById } from '@/hooks/kardex/use-kardex-entry-by-id';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { ApiError } from '@/infrastructure/http/http-client';

const numberField = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatorio`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} tiene que ser un número`);

// A diferencia de la versión anterior, acá no se puede validar "venta
// necesita inversionista" con un `.superRefine` — el schema solo ve
// `movementTypeId` (un id sin significado propio, ver el catálogo real en
// `GET /kardex-movement-types`), no el nombre resuelto ("ingreso"/"venta"/
// "baja"). Esa validación se hace en `submit()`, que ya tiene `isVenta`
// resuelto contra la lista cargada.
const kardexEntrySchema = z.object({
  entryDate: z.string().min(1, 'La fecha es obligatoria'),
  detail: z.string().min(1, 'El detalle es obligatorio'),
  movementTypeId: z.string().min(1, 'Selecciona un tipo de movimiento'),
  investorUserId: z.string().optional(),
  avgWeight: numberField('El peso promedio'),
  entryQuantity: numberField('La cantidad de entrada'),
  entryKilos: numberField('Los kilos de entrada'),
  exitQuantity: numberField('La cantidad de salida'),
  exitKilos: numberField('Los kilos de salida'),
  total: numberField('El total'),
});

type KardexEntryFormData = z.infer<typeof kardexEntrySchema>;

interface KardexEntryDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntryListItem | null;
  /** Inversionistas de la inversión activa (ya resueltos a nombre) — para
   * el combo que solo se muestra cuando el tipo de movimiento es "venta". */
  investors: UserOption[];
  onClose: () => void;
  onSave: (data: KardexEntryFields) => Promise<void>;
}

/** `entryQuantity`/`exitQuantity` son cabezas de ganado (enteros) — `toFixed`
 * no aplica ahí. `entryKilos`/`exitKilos`/`total` sí son decimales, se
 * cargan con 2 decimales fijos (`toFixed(2)`) para que el input no muestre
 * "36506" en vez de "36506.00" al editar un movimiento existente. */
function toFormValues(entry: KardexEntry | null): KardexEntryFormData {
  return {
    entryDate: entry?.entryDate ?? '',
    detail: entry?.detail ?? '',
    movementTypeId: entry?.movementTypeId ?? '',
    investorUserId: entry?.investorUserId ?? '',
    avgWeight: entry ? String(entry.avgWeight) : '',
    entryQuantity: entry ? String(entry.entryQuantity) : '0',
    entryKilos: entry ? entry.entryKilos.toFixed(2) : '0.00',
    exitQuantity: entry ? String(entry.exitQuantity) : '0',
    exitKilos: entry ? entry.exitKilos.toFixed(2) : '0.00',
    total: entry ? entry.total.toFixed(2) : '0.00',
  };
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** `kilos / cantidad` — mismo cálculo para Ingreso (con los campos de
 * Entrada) y Venta (con los de Salida). `0` si la cantidad todavía no se
 * cargó o es 0, para no mostrar `NaN`/`Infinity` mientras el usuario tipea. */
function computeAvgWeight(quantity: string, kilos: string): string {
  const parsedQuantity = Number(quantity);
  const parsedKilos = Number(kilos);
  if (!parsedQuantity || Number.isNaN(parsedKilos)) return '0';
  return (parsedKilos / parsedQuantity).toFixed(2);
}

/** Igual estructura que el resto de los diálogos, agrupando Cantidad/Kilos
 * de Entrada y Salida de a pares — mismo agrupamiento visual que la
 * planilla de referencia (docs/investment/investment.md).
 *
 * El "Tipo de movimiento" (ahora un catálogo real, `GET
 * /kardex-movement-types`, no 3 strings hardcodeados) decide qué más se
 * muestra: "Ingreso" pide Entrada (cantidad/kilos) + Total, sin
 * inversionista. "Venta" pide Salida (cantidad/kilos) + Total + un
 * inversionista puntual. "Baja" pide solo Salida — cantidad (sin kilos, sin
 * total, sin inversionista). El saldo (`balanceQuantity`/`balanceKilos`/
 * `total` de la inversión) ya no se tipea acá: lo calcula el backend y vive
 * en `Investment` (ver ese doc).
 *
 * "Peso promedio" = kilos / cantidad en Ingreso y Venta (los dos únicos
 * tipos que piden cantidad Y kilos) — se calcula solo, no se tipea, y se
 * muestra debajo del par Cantidad/Kilos que lo determina (a pedido del
 * usuario). En Baja no hay kilos de los que derivarlo, así que ahí sigue
 * siendo un dato manual, debajo de "Salida — cantidad".
 *
 * En edición, `entry` (la fila de la lista, a propósito liviana — ver
 * `KardexEntryListItem`) solo se usa para saber QUÉ id editar. Todos los
 * valores del formulario salen de `useKardexEntryById`, nunca de esa fila
 * — mismo criterio que `InvestmentDialog`/`UserDialog`: el diálogo de
 * edición no depende del listado, pide el detalle completo por id.
 */
export function KardexEntryDialog({ open, mode, entry, investors, onClose, onSave }: KardexEntryDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: movementTypesData } = useMovementTypes();
  const movementTypes = movementTypesData ?? [];
  const { data: entryDetail, isLoading: entryDetailLoading } = useKardexEntryById(
    mode === 'edit' ? (entry?.id ?? null) : null,
  );
  const loadingDetail = mode === 'edit' && entryDetailLoading;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError: setFieldError,
    formState: { errors },
  } = useForm<KardexEntryFormData>({
    resolver: zodResolver(kardexEntrySchema),
    // `values` (no `defaultValues`): el detalle llega después del primer
    // render (`useKardexEntryById` es async) — con `values` el formulario
    // se resincroniza solo apenas llega, sin `reset()` manual (mismo
    // criterio que `EditUserForm`/`InvestmentDialog`).
    values: toFormValues(mode === 'edit' ? (entryDetail ?? null) : null),
  });

  // `useWatch` (no `form.watch()`) — es un hook de verdad, compatible con
  // el React Compiler; `watch()` es una función de escape que lo desactiva
  // para todo el componente (ver warning de `react-hooks/incompatible-library`).
  const movementTypeId = useWatch({ control, name: 'movementTypeId' });
  const movementTypeName = movementTypes.find((type) => type.id === movementTypeId)?.name;
  const isIngreso = movementTypeName === 'ingreso';
  const isVenta = movementTypeName === 'venta';
  const isBaja = movementTypeName === 'baja';

  const entryQuantity = useWatch({ control, name: 'entryQuantity' });
  const entryKilos = useWatch({ control, name: 'entryKilos' });
  const exitQuantity = useWatch({ control, name: 'exitQuantity' });
  const exitKilos = useWatch({ control, name: 'exitKilos' });
  const avgWeight = useWatch({ control, name: 'avgWeight' });

  // Cambiar de tipo descarta el inversionista elegido — evita mandar un
  // `investorUserId` viejo si se pasa de "venta" a otro tipo y se vuelve.
  useEffect(() => {
    if (!isVenta) {
      setValue('investorUserId', '');
    }
  }, [isVenta, setValue]);

  // Peso promedio calculado — se recalcula en cada cambio de cantidad/kilos
  // de Entrada (Ingreso) o Salida (Venta). En Baja no hay nada que calcular
  // (no pide kilos), así que el campo sigue siendo el `register` normal.
  useEffect(() => {
    if (isIngreso) {
      setValue('avgWeight', computeAvgWeight(entryQuantity, entryKilos));
    } else if (isVenta) {
      setValue('avgWeight', computeAvgWeight(exitQuantity, exitKilos));
    }
  }, [isIngreso, isVenta, entryQuantity, entryKilos, exitQuantity, exitKilos, setValue]);

  async function submit(data: KardexEntryFormData): Promise<void> {
    // Solo "venta" se atribuye a un inversionista puntual — ver
    // docs/investment/investment.md del backend ("Reglas de negocio actuales").
    if (isVenta && !data.investorUserId) {
      setFieldError('investorUserId', { message: 'Selecciona un inversionista' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        entryDate: data.entryDate,
        detail: data.detail,
        movementTypeId: data.movementTypeId,
        investorUserId: isVenta ? (data.investorUserId ?? null) : null,
        avgWeight: Number(data.avgWeight),
        entryQuantity: Number(data.entryQuantity),
        entryKilos: Number(data.entryKilos),
        exitQuantity: Number(data.exitQuantity),
        exitKilos: Number(data.exitKilos),
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
      <div className="dialog-panel dialog-panel-lg flex flex-col gap-8" style={{ maxWidth: '32rem' }}>
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nuevo movimiento' : 'Editar movimiento'}</h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa los datos del nuevo movimiento de kardex.' : 'Modifica los datos del movimiento.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Input label="Fecha" type="date" disabled={loadingDetail} error={errors.entryDate?.message} {...register('entryDate')} />
            <Input
              label="Detalle"
              placeholder="Ej. Ingreso de 208 torillos"
              autoFocus
              disabled={loadingDetail}
              error={errors.detail?.message}
              {...register('detail')}
            />
            <Select
              label="Tipo de movimiento"
              error={errors.movementTypeId?.message}
              disabled={loadingDetail}
              {...register('movementTypeId')}
            >
              {movementTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {capitalize(type.name)}
                </option>
              ))}
            </Select>

            {isVenta && (
              <Select
                label="Inversionista"
                error={errors.investorUserId?.message}
                disabled={loadingDetail}
                {...register('investorUserId')}
              >
                {investors.map((investor) => (
                  <option key={investor.id} value={investor.id}>
                    {investor.fullName}
                  </option>
                ))}
              </Select>
            )}

            {isIngreso && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Entrada — cantidad" type="number" disabled={loadingDetail} error={errors.entryQuantity?.message} {...register('entryQuantity')} />
                <Controller
                  control={control}
                  name="entryKilos"
                  render={({ field }) => (
                    <FormattedNumberInput
                      label="Entrada — kilos"
                      disabled={loadingDetail}
                      error={errors.entryKilos?.message}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            )}

            {isBaja && (
              <Input label="Salida — cantidad" type="number" disabled={loadingDetail} error={errors.exitQuantity?.message} {...register('exitQuantity')} />
            )}

            {isVenta && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Salida — cantidad" type="number" disabled={loadingDetail} error={errors.exitQuantity?.message} {...register('exitQuantity')} />
                <Controller
                  control={control}
                  name="exitKilos"
                  render={({ field }) => (
                    <FormattedNumberInput
                      label="Salida — kilos"
                      disabled={loadingDetail}
                      error={errors.exitKilos?.message}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            )}

            {(isIngreso || isVenta) && (
              <Input
                label="Peso promedio (calculado)"
                type="number"
                step="0.01"
                value={avgWeight}
                disabled
                title="Kilos / cantidad — se calcula solo"
              />
            )}

            {isBaja && (
              <Input label="Peso promedio" type="number" step="0.01" disabled={loadingDetail} error={errors.avgWeight?.message} {...register('avgWeight')} />
            )}

            {(isIngreso || isVenta) && (
              <Controller
                control={control}
                name="total"
                render={({ field }) => (
                  <FormattedNumberInput
                    label="Total Bs."
                    disabled={loadingDetail}
                    error={errors.total?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            )}
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
