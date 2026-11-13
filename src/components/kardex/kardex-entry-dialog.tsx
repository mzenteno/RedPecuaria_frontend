'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { KardexEntry, KardexEntryFields, KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { useMovementTypes } from '@/hooks/movement-type/use-movement-types';
import { useKardexEntryById } from '@/hooks/kardex/use-kardex-entry-by-id';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { ApiError } from '@/infrastructure/http/http-client';
import { capitalize } from '@/lib/capitalize';

const numberField = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatorio`)
    .refine((value) => !Number.isNaN(Number(value)), `${label} tiene que ser un número`);

const kardexEntrySchema = z.object({
  entryDate: z.string().min(1, 'La fecha es obligatoria'),
  detail: z.string().min(1, 'El detalle es obligatorio'),
  movementTypeId: z.string().min(1, 'Selecciona un tipo de movimiento'),
  avgWeight: numberField('Este valor'),
  entryQuantity: numberField('La cantidad de entrada'),
  entryKilos: numberField('Los kilos de entrada'),
  exitQuantity: numberField('La cantidad de salida'),
  exitKilos: numberField('Los kilos de salida'),
  total: numberField('El total'),
  pricePerKilo: numberField('El precio por kilo'),
  shrinkageKilos: numberField('El desbaste'),
  shrinkagePercent: numberField('El desbaste %'),
  initialWeightPerHead: numberField('El peso inicial por cabeza'),
  distributionCommission: numberField('La comisión de distribución'),
  feedCost: numberField('El alimento'),
  transportDescription: z.string().max(255, 'Máximo 255 caracteres'),
  otherExpensesDescription: z.string().max(255, 'Máximo 255 caracteres'),
  commission: numberField('La comisión'),
  commissionPercent: numberField('La comisión %'),
  transport: numberField('El transporte'),
  otherExpenses: numberField('Otros gastos'),
  // Solo del formulario (modo "dinero"): el monto base antes de gastos. No
  // se guarda — se reconstruye como `total - gastos` al editar.
  baseAmount: numberField('El monto'),
});

type KardexEntryFormData = z.infer<typeof kardexEntrySchema>;

interface KardexEntryDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  entry: KardexEntryListItem | null;
  /** El inversionista cuyo Kardex se está viendo (elegido en la pantalla
   * anterior, ver `(main)/kardex/page.tsx`) — TODO movimiento nuevo queda
   * atado a él, ya no se elige por tipo de movimiento (a pedido del
   * usuario, 2026-10-14: antes solo "venta" pedía inversionista). */
  investorUserId: string;
  /** 'kilo' o 'dinero' (`Investment.investmentTypeName`) — decide si este
   * diálogo pide kilos (modo original) o no pide nada de kilos y usa
   * `total` como el dato físico de Entrada/Salida (ver
   * docs/investment/investment.md). Fijo por inversión, nunca cambia
   * mientras el diálogo está abierto. */
  investmentTypeName: string;
  onClose: () => void;
  onSave: (data: KardexEntryFields) => Promise<void>;
}

/** `entryQuantity`/`exitQuantity` son cabezas de ganado (enteros) — `toFixed`
 * no aplica ahí. `avgWeight`/`entryKilos`/`exitKilos`/`total` sí son
 * decimales, se cargan con 2 decimales fijos (`toFixed(2)`) para que el
 * input no muestre "36506" en vez de "36506.00" al editar un movimiento
 * existente. */
function toFormValues(entry: KardexEntry | null): KardexEntryFormData {
  const expenses = entry ? entry.commission + entry.transport + entry.otherExpenses : 0;
  return {
    entryDate: entry?.entryDate ?? '',
    detail: entry?.detail ?? '',
    movementTypeId: entry?.movementTypeId ?? '',
    avgWeight: entry ? entry.avgWeight.toFixed(2) : '0.00',
    entryQuantity: entry ? String(entry.entryQuantity) : '0',
    entryKilos: entry ? entry.entryKilos.toFixed(2) : '0.00',
    exitQuantity: entry ? String(entry.exitQuantity) : '0',
    exitKilos: entry ? entry.exitKilos.toFixed(2) : '0.00',
    total: entry ? entry.total.toFixed(2) : '0.00',
    pricePerKilo: entry ? entry.pricePerKilo.toFixed(2) : '0.00',
    shrinkageKilos: entry ? entry.shrinkageKilos.toFixed(2) : '0.00',
    shrinkagePercent: entry ? entry.shrinkagePercent.toFixed(2) : '0.00',
    initialWeightPerHead: entry ? entry.initialWeightPerHead.toFixed(2) : '0.00',
    distributionCommission: entry ? entry.distributionCommission.toFixed(2) : '0.00',
    feedCost: entry ? entry.feedCost.toFixed(2) : '0.00',
    transportDescription: entry?.transportDescription ?? '',
    otherExpensesDescription: entry?.otherExpensesDescription ?? '',
    commission: entry ? entry.commission.toFixed(2) : '0.00',
    commissionPercent: entry ? entry.commissionPercent.toFixed(2) : '0.00',
    transport: entry ? entry.transport.toFixed(2) : '0.00',
    otherExpenses: entry ? entry.otherExpenses.toFixed(2) : '0.00',
    baseAmount: entry ? (entry.total - expenses).toFixed(2) : '0.00',
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Campos que, al cambiar, recalculan el desbaste en kg (= peso bruto × %). */
const SHRINKAGE_DEPENDENCIES = new Set(['movementTypeId', 'entryKilos', 'exitKilos', 'shrinkagePercent']);
/** Campos que, al cambiar, recalculan la comisión en Bs. (= subtotal × %) —
 * todo lo que mueve el subtotal, más el propio %. */
const COMMISSION_DEPENDENCIES = new Set([
  ...SHRINKAGE_DEPENDENCIES,
  'pricePerKilo',
  'baseAmount',
  'commissionPercent',
]);

/** Subtotal antes de gastos: kilos × precio por kilo (modo "kilo"; kilos de
 * Entrada en Ingreso, de Salida en Venta) o el monto tipeado (modo
 * "dinero", donde el precio por kilo es solo informativo). Redondeado a
 * centavos, como se guarda. */
function computeSubtotal(values: KardexEntryFormData, isDinero: boolean, isIngreso: boolean): number {
  if (isDinero) return toNumber(values.baseAmount);
  // Se paga/cobra el peso NETO: peso total − desbaste (Ingreso 2026-11-08,
  // Venta 2026-11-08 también).
  const kilos = toNumber(isIngreso ? values.entryKilos : values.exitKilos) - toNumber(values.shrinkageKilos);
  return Math.round(kilos * toNumber(values.pricePerKilo) * 100) / 100;
}

/** Total Bs. = subtotal + comisión + transporte + otros gastos — los gastos
 * se SUMAN también en Venta (a pedido del usuario, 2026-10-25). */
function computeTotal(values: KardexEntryFormData, isDinero: boolean, isIngreso: boolean): string {
  const expenses = toNumber(values.commission) + toNumber(values.transport) + toNumber(values.otherExpenses);
  return (computeSubtotal(values, isDinero, isIngreso) + expenses).toFixed(2);
}


/** `valor / cantidad` — mismo cálculo para Ingreso (con los campos de
 * Entrada) y Venta (con los de Salida), sea `valor` los kilos (modo "kilo")
 * o el `total` (modo "dinero", ver `computeMovementDelta` del backend). `0`
 * si la cantidad todavía no se cargó o es 0, para no mostrar
 * `NaN`/`Infinity` mientras el usuario tipea. */
function computeAverage(quantity: string, value: string): string {
  const parsedQuantity = Number(quantity);
  const parsedValue = Number(value);
  if (!parsedQuantity || Number.isNaN(parsedValue)) return '0';
  return (parsedValue / parsedQuantity).toFixed(2);
}

/** Igual estructura que el resto de los diálogos, agrupando Cantidad/Kilos
 * de Entrada y Salida de a pares — mismo agrupamiento visual que la
 * planilla de referencia (docs/investment/investment.md).
 *
 * El "Tipo de movimiento" (ahora un catálogo real, `GET
 * /kardex-movement-types`, no 3 strings hardcodeados) decide qué más se
 * muestra: "Ingreso" pide Entrada (cantidad/kilos) + Total. "Venta" pide
 * Salida (cantidad/kilos) + Total. "Baja" pide Salida — cantidad + Salida —
 * kilos (mismo título/campo que Venta). TODO movimiento se atribuye a
 * `investorUserId` (prop fija, el inversionista cuyo Kardex se está viendo
 * — a pedido del usuario, 2026-10-14, antes solo "venta" lo pedía y con un
 * combo propio acá) — ya no hay nada que elegir en este formulario. El
 * saldo (`balanceQuantity`/`balanceKilos`/`total`) ya no se tipea acá: lo
 * calcula el backend y vive en `Investment`/`InvestmentInvestor` (ver esos
 * docs).
 *
 * `investmentTypeName` ('kilo'/'dinero', fijo por inversión) decide si
 * "Entrada — kilos"/"Salida — kilos" se muestran o no: en modo "dinero" NO
 * se piden — el único dato de esa fila pasa a ser `total` (que ya existía
 * en el formulario para Debe/Haber, o el mismo campo `avgWeight` en Baja,
 * relabeleado a "Total Bs."), y "Peso promedio" pasa a llamarse "Monto
 * promedio" (mismo cálculo, `computeAverage`, pero con `total` en vez de
 * kilos).
 *
 * "Peso/Monto promedio" en Ingreso/Venta = kilos-o-monto (sin gastos) / cantidad — se
 * calcula solo, no se tipea, y se muestra debajo del par Cantidad/Kilos que
 * lo determina. En **Baja** el mismo campo `avgWeight` se reusa distinto (a
 * pedido del usuario, 2026-09-24): en vez de mostrarse como un promedio
 * calculado, se tipea A MANO como "Salida — kilos" (modo kilo) o "Total
 * Bs." (modo dinero) — mismo título/estilo (`FormattedNumberInput`) que
 * usa Venta para su campo equivalente, porque acá el valor SÍ resta
 * directo del saldo (`computeMovementDelta`), no es un promedio
 * informativo. `total` de Baja se mantiene siempre en 0 (no se toca) para
 * no ensuciar Debe/Haber — la pérdida se resta del `kilos`/`total` de
 * `Investment`, no del `total` del propio `KardexEntry`.
 *
 * Precio y gastos (a pedido del usuario, 2026-10-25), solo Ingreso/Venta:
 * en modo "kilo" se tipea "Precio por kilo" (subtotal = kilos × precio); en
 * modo "dinero" se tipea "Entrada/Salida — Bs." directo (subtotal = ese
 * monto) y el precio por kilo es solo informativo (no hay kilos). Mismo
 * orden de campos en ambos modos.
 * Después van Comisión, Transporte y Otros gastos, y "Total Bs." = subtotal
 * + gastos, calculado (ya no se tipea). Los gastos se SUMAN también en
 * Venta. Solo se ven en este diálogo, no en la tabla ni en el PDF.
 *
 * En edición, `entry` (la fila de la lista, a propósito liviana — ver
 * `KardexEntryListItem`) solo se usa para saber QUÉ id editar. Todos los
 * valores del formulario salen de `useKardexEntryById`, nunca de esa fila
 * — mismo criterio que `InvestmentDialog`/`UserDialog`: el diálogo de
 * edición no depende del listado, pide el detalle completo por id.
 */
export function KardexEntryDialog({
  open,
  mode,
  entry,
  investorUserId,
  investmentTypeName,
  onClose,
  onSave,
}: KardexEntryDialogProps) {
  const isDinero = investmentTypeName === 'dinero';
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
    getValues,
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
  const total = useWatch({ control, name: 'total' });
  const avgWeight = useWatch({ control, name: 'avgWeight' });
  const pricePerKilo = useWatch({ control, name: 'pricePerKilo' });
  const baseAmount = useWatch({ control, name: 'baseAmount' });
  const shrinkageKilos = useWatch({ control, name: 'shrinkageKilos' });
  const commission = useWatch({ control, name: 'commission' });
  const netKilos = toNumber(isIngreso ? entryKilos : exitKilos) - toNumber(shrinkageKilos);

  // Total Bs. se recalcula SOLO cuando el usuario toca uno de los campos de
  // los que depende (no con un `useEffect` sobre los valores): así, al
  // editar un movimiento viejo sin tocar esos campos, su `total` guardado
  // queda exacto — el precio por kilo de los movimientos previos a
  // 2026-10-25 se reconstruyó redondeado (`total / kilos`), y recalcular
  // kilos × precio podría correrlo unos centavos.
  //
  // Desbaste y comisión se tipean en % (2026-11-11): desbaste kg = peso
  // bruto × %, comisión Bs. = subtotal × %. Mismo criterio: cada uno se
  // recalcula solo si cambió algo de lo que depende — el % de los
  // movimientos viejos se completó redondeado (migración), y recalcular el
  // kg/Bs. al tocar, por ejemplo, el transporte podría correrlos unos
  // centavos.
  function recalcTotal(changedField: string): void {
    const values = getValues();
    const typeName = movementTypes.find((type) => type.id === values.movementTypeId)?.name;
    if (typeName !== 'ingreso' && typeName !== 'venta') return;
    const isIngresoType = typeName === 'ingreso';

    if (SHRINKAGE_DEPENDENCIES.has(changedField)) {
      const grossKilos = toNumber(isIngresoType ? values.entryKilos : values.exitKilos);
      const shrinkage = isDinero ? 0 : roundCents((grossKilos * toNumber(values.shrinkagePercent)) / 100);
      values.shrinkageKilos = shrinkage.toFixed(2);
      setValue('shrinkageKilos', values.shrinkageKilos);
    }
    if (COMMISSION_DEPENDENCIES.has(changedField)) {
      const subtotalValue = computeSubtotal(values, isDinero, isIngresoType);
      values.commission = roundCents((subtotalValue * toNumber(values.commissionPercent)) / 100).toFixed(2);
      setValue('commission', values.commission);
    }
    setValue('total', computeTotal(values, isDinero, isIngresoType));
  }

  const subtotal = computeSubtotal(
    {
      ...getValues(),
      entryKilos,
      exitKilos,
      pricePerKilo,
      shrinkageKilos,
    },
    isDinero,
    isIngreso,
  );

  // Promedio calculado — se recalcula en cada cambio de cantidad + el
  // segundo valor que corresponda según el tipo de inversión: kilos (modo
  // "kilo") o `total` (modo "dinero", que no pide kilos). En Baja no hay
  // nada que calcular (no pide ninguno de los dos), así que el campo sigue
  // siendo el `register` normal.
  // En modo "dinero" el promedio es Entrada/Salida Bs. / cantidad, SIN
  // gastos (2026-10-26). En modo "kilo" es el PESO NETO (kilos − desbaste)
  // / cantidad (2026-11-09) — el kardex trabaja con el peso neto, igual que
  // el saldo (`computeMovementDelta` del backend).
  useEffect(() => {
    const netValue = String(netKilos);
    if (isIngreso) {
      setValue('avgWeight', computeAverage(entryQuantity, isDinero ? baseAmount : netValue));
    } else if (isVenta) {
      setValue('avgWeight', computeAverage(exitQuantity, isDinero ? baseAmount : netValue));
    }
  }, [isIngreso, isVenta, isDinero, entryQuantity, exitQuantity, netKilos, baseAmount, setValue]);

  async function submit(data: KardexEntryFormData): Promise<void> {
    // Baja no lleva precio ni gastos — se mandan en 0 aunque el formulario
    // haya quedado con algo tipeado de un tipo de movimiento elegido antes.
    const hasExpenses = isIngreso || isVenta;
    // Desbaste: Ingreso y Venta en modo "kilo".
    const hasShrinkage = hasExpenses && !isDinero;
    // Distribución de la liquidación de venta: solo Venta en modo "kilo".
    const hasDistribution = isVenta && !isDinero;
    if ((hasShrinkage && Number(data.shrinkagePercent) > 100) || (hasExpenses && Number(data.commissionPercent) > 100)) {
      setError('El desbaste y la comisión no pueden ser mayores a 100%');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        entryDate: data.entryDate,
        detail: data.detail,
        movementTypeId: data.movementTypeId,
        investorUserId,
        avgWeight: Number(data.avgWeight),
        entryQuantity: Number(data.entryQuantity),
        entryKilos: Number(data.entryKilos),
        exitQuantity: Number(data.exitQuantity),
        exitKilos: Number(data.exitKilos),
        total: Number(data.total),
        pricePerKilo: hasExpenses ? Number(data.pricePerKilo) : 0,
        shrinkageKilos: hasShrinkage ? Number(data.shrinkageKilos) : 0,
        shrinkagePercent: hasShrinkage ? Number(data.shrinkagePercent) : 0,
        initialWeightPerHead: hasDistribution ? Number(data.initialWeightPerHead) : 0,
        distributionCommission: hasDistribution ? Number(data.distributionCommission) : 0,
        feedCost: hasDistribution ? Number(data.feedCost) : 0,
        transportDescription: hasExpenses ? data.transportDescription.trim() : '',
        otherExpensesDescription: hasExpenses ? data.otherExpensesDescription.trim() : '',
        commission: hasExpenses ? Number(data.commission) : 0,
        commissionPercent: hasExpenses ? Number(data.commissionPercent) : 0,
        transport: hasExpenses ? Number(data.transport) : 0,
        otherExpenses: hasExpenses ? Number(data.otherExpenses) : 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el movimiento');
    } finally {
      setSaving(false);
    }
  }

  /** Campo de Bs./kilos que interviene en el Total — al cambiar, recalcula
   * (ver `recalcTotal`). Función que devuelve JSX, no un componente: uno
   * definido acá adentro se remontaría en cada render y el input perdería
   * el foco al tipear. */
  function renderMoneyField(
    name:
      | 'baseAmount'
      | 'entryKilos'
      | 'exitKilos'
      | 'pricePerKilo'
      | 'shrinkagePercent'
      | 'initialWeightPerHead'
      | 'distributionCommission'
      | 'feedCost'
      | 'commissionPercent'
      | 'transport'
      | 'otherExpenses',
    label: string,
  ) {
    return (
      <Controller
        key={name}
        control={control}
        name={name}
        render={({ field }) => (
          <FormattedNumberInput
            label={label}
            disabled={loadingDetail}
            error={errors[name]?.message}
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              recalcTotal(name);
            }}
            onBlur={field.onBlur}
          />
        )}
      />
    );
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel dialog-panel-lg flex flex-col gap-8" style={{ maxWidth: '42rem' }}>
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
              {...register('movementTypeId', { onChange: () => recalcTotal('movementTypeId') })}
            >
              {movementTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {capitalize(type.name)}
                </option>
              ))}
            </Select>

            {(isIngreso || isVenta) && (
              <div className="grid grid-cols-2 gap-4">
                {isIngreso ? (
                  <Input label="Entrada — cantidad" type="number" disabled={loadingDetail} error={errors.entryQuantity?.message} {...register('entryQuantity')} />
                ) : (
                  <Input label="Salida — cantidad" type="number" disabled={loadingDetail} error={errors.exitQuantity?.message} {...register('exitQuantity')} />
                )}
                {isDinero ? (
                  renderMoneyField('baseAmount', isIngreso ? 'Entrada — Bs.' : 'Salida — Bs.')
                ) : (
                  renderMoneyField(
                    isIngreso ? 'entryKilos' : 'exitKilos',
                    // Ingreso y Venta son de la misma naturaleza: el dato que se
                    // tipea es el peso bruto (antes del desbaste), 2026-11-10.
                    'Peso bruto kg',
                  )
                )}
                {/* Desbaste y peso neto: Ingreso y Venta en modo "kilo". Se
                    tipea el % del peso bruto (2026-11-11), los kg salen
                    solos. El subtotal y el saldo usan el peso neto. */}
                {!isDinero && (
                  <div className="col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {renderMoneyField('shrinkagePercent', 'Desbaste %')}
                    <FormattedNumberInput
                      label="Desbaste kg"
                      value={shrinkageKilos}
                      onChange={() => undefined}
                      disabled
                      dashWhenZero
                    />
                    <FormattedNumberInput
                      label="Peso neto kg"
                      value={netKilos.toFixed(2)}
                      onChange={() => undefined}
                      disabled
                      dashWhenZero
                    />
                  </div>
                )}
                <FormattedNumberInput
                  label={isDinero ? 'Monto promedio' : 'Peso promedio'}
                  value={avgWeight}
                  onChange={() => undefined}
                  disabled
                  dashWhenZero
                />
                {/* En modo "dinero" no hay kilos: el precio por kilo se guarda
                    solo como dato informativo, no entra en ningún cálculo
                    (a pedido del usuario, 2026-10-26, para que ambos modos
                    tengan el mismo formulario). */}
                {renderMoneyField('pricePerKilo', 'Precio por kilo Bs.')}
              </div>
            )}

            {(isIngreso || isVenta) && (
              <FormattedNumberInput
                label={
                  isDinero
                    ? `Subtotal Bs. (= ${isIngreso ? 'Entrada' : 'Salida'} Bs.)`
                    : 'Subtotal Bs. (peso neto × precio por kilo)'
                }
                value={subtotal.toFixed(2)}
                onChange={() => undefined}
                disabled
                dashWhenZero
              />
            )}

            {isBaja && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Salida — cantidad" type="number" disabled={loadingDetail} error={errors.exitQuantity?.message} {...register('exitQuantity')} />
                <Controller
                  control={control}
                  name="avgWeight"
                  render={({ field }) => (
                    <FormattedNumberInput
                      label={isDinero ? 'Total Bs.' : 'Salida — kilos'}
                      disabled={loadingDetail}
                      error={errors.avgWeight?.message}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            )}

            {/* Gastos (2026-11-10): Comisión sola, y Transporte / Otros gastos
                cada uno con su descripción al lado — el texto de esa línea en
                la liquidación de compra/venta (opcional: vacío = texto fijo
                en el PDF). En celular, todo apilado. */}
            {(isIngreso || isVenta) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Comisión: se tipea el % del subtotal (2026-11-11). */}
                {renderMoneyField('commissionPercent', 'Comisión %')}
                <FormattedNumberInput
                  label="Comisión Bs."
                  value={commission}
                  onChange={() => undefined}
                  disabled
                  dashWhenZero
                />
                <div className="hidden sm:block" />
                {renderMoneyField('transport', 'Transporte Bs.')}
                <div className="sm:col-span-2">
                  <Input
                    label="Descripción del transporte"
                    placeholder="Ej. Costo de transporte de los torillos a El Carmen Rivero Torres"
                    maxLength={255}
                    disabled={loadingDetail}
                    error={errors.transportDescription?.message}
                    {...register('transportDescription')}
                  />
                </div>
                {renderMoneyField('otherExpenses', 'Otros gastos Bs.')}
                <div className="sm:col-span-2">
                  <Input
                    label="Descripción de otros gastos"
                    placeholder="Ej. Vacunas y marcado"
                    maxLength={255}
                    disabled={loadingDetail}
                    error={errors.otherExpensesDescription?.message}
                    {...register('otherExpensesDescription')}
                  />
                </div>
              </div>
            )}

            {(isIngreso || isVenta) && (
              <FormattedNumberInput
                label={isDinero ? 'Total Bs. (monto + gastos)' : 'Total Bs. (subtotal + gastos)'}
                error={errors.total?.message}
                value={total}
                onChange={() => undefined}
                disabled
                dashWhenZero
              />
            )}

            {/* Distribución de la ganancia de kilos (liquidación de venta,
                2026-11-09): solo Venta en modo "kilo". Son datos para el
                PDF — no cambian el Total Bs. ni el saldo. */}
            {isVenta && !isDinero && (
              <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="tipo-label">Distribución (liquidación de venta)</span>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {renderMoneyField('initialWeightPerHead', 'Peso inicial por cabeza kg')}
                  {renderMoneyField('distributionCommission', 'Comisión Bs.')}
                  {renderMoneyField('feedCost', 'Alimento Bs.')}
                </div>
              </div>
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
