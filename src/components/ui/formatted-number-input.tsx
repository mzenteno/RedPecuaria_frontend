'use client';

import { useState } from 'react';
import { Input } from './input';
import { formatDecimalInput, parseDecimalInput } from '@/lib/format-number';

interface FormattedNumberInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  /** Siempre un string numérico plano ("36506.00"), nunca formateado — es
   * lo que el resto del formulario (zod, `computeAvgWeight`, el submit)
   * espera poder parsear con `Number(...)`. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Para campos calculados de solo lectura: 0 se muestra como "-" (igual
   * que en tablas y PDFs, ver `formatNumberOrDash`). Nunca en un campo
   * editable — ahí el "0,00" tiene que poder reemplazarse tipeando. */
  dashWhenZero?: boolean;
}

/**
 * Input de texto para campos decimales (kilos, montos) que muestra
 * separador de miles ("36.506,00") cuando no está enfocado, y el valor
 * "crudo" (sin separadores) mientras se está editando — reformatear en
 * cada tecla mientras se escribe pelea con la posición del cursor, así que
 * se formatea recién al perder el foco (`onBlur`), igual criterio que
 * cualquier input de moneda. No es un `<input type="number">` nativo: esos
 * no pueden mostrar puntos de miles (el navegador los rechaza como
 * caracter inválido), por eso este componente controla el string a mano.
 */
export function FormattedNumberInput({
  label,
  error,
  disabled,
  value,
  onChange,
  onBlur,
  dashWhenZero = false,
}: FormattedNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Input
      type="text"
      inputMode="decimal"
      label={label}
      error={error}
      disabled={disabled}
      value={isFocused ? value : dashWhenZero && Number(value) === 0 ? '-' : formatDecimalInput(value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        onBlur?.();
      }}
      onChange={(e) => onChange(parseDecimalInput(e.target.value))}
    />
  );
}
