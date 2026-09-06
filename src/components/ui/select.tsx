import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /** Texto de "sin elegir todavía" — un solo lugar para no repetirlo en
   * cada combo del proyecto. No aparece como un renglón más de la lista
   * (la opción es `disabled hidden`), solo se ve en el combo cerrado
   * mientras no haya un valor real elegido (con el mismo gris que
   * `Input`, vía `:invalid` en `globals.css`). Pasar `null` para un combo
   * que no necesita este estado (ej. `CompanySelectDialog`, que siempre
   * arranca con una opción real seleccionada). */
  placeholder?: string | null;
  /** Botón "×" para volver el combo a "sin elegir" — solo tiene sentido en
   * un combo que actúa como FILTRO opcional (ej. la fila de filtros de
   * `app/(main)/investments`), nunca en un campo obligatorio de un
   * formulario de alta/edición (ahí simplemente no se pasa esta prop). Se
   * muestra solo cuando ya hay un valor real elegido — sin volver a
   * ofrecer una opción "Todos"/"Todas" dentro de la lista (regla general
   * del proyecto, ver `frontend/ARCHITECTURE.md` §10): es una forma de
   * deshacer la elección, no un renglón más del combo. Hace falta esto
   * porque la opción placeholder es `disabled hidden` — una vez elegido
   * un valor real, no hay forma nativa de volver a ella desde el `<select>`
   * abierto. */
  onClear?: () => void;
}

/**
 * Mismo `<select>` nativo + `ChevronDown` superpuesto que ya usaba
 * `CompanySelectDialog` a mano — extraído acá para no repetirlo en cada
 * diálogo que necesite un combo (Usuarios necesita 3: tipo de usuario,
 * empresa y rol).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, placeholder = 'Selecciona un valor', onClear, className = '', id, children, ...props },
  ref,
) {
  const showClear = Boolean(onClear) && props.value !== undefined && props.value !== '';
  return (
    <div>
      {label && (
        <label htmlFor={id} className="tipo-label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={placeholder !== null}
          className={`form-input w-full appearance-none ${onClear ? 'pr-16' : 'pr-10'} ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        >
          {placeholder !== null && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpiar selección"
            className="absolute right-8 top-1/2 -translate-y-1/2 hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
      {error && <p className="tipo-error">{error}</p>}
    </div>
  );
});
