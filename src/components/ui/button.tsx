import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  /**
   * Botones estandarizados (ver ARCHITECTURE.md §2): Aceptar/Guardar/Confirmar/
   * Eliminar — cualquier botón que confirma una acción — siempre usa `primary`
   * (verde, el default). Cancelar siempre usa `secondary` (gris). Sin variante
   * roja/destructiva a propósito: es la regla del proyecto, no solo un color.
   */
  variant?: 'primary' | 'secondary';
}

const VARIANT_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
} as const;

export function Button({
  loading,
  disabled,
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variantClass = VARIANT_CLASSES[variant];

  return (
    <button disabled={disabled || loading} className={`${variantClass} ${className}`} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
