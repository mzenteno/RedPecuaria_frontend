import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

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
}

/**
 * Mismo `<select>` nativo + `ChevronDown` superpuesto que ya usaba
 * `CompanySelectDialog` a mano — extraído acá para no repetirlo en cada
 * diálogo que necesite un combo (Usuarios necesita 3: tipo de usuario,
 * empresa y rol).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, placeholder = 'Selecciona un valor', className = '', id, children, ...props },
  ref,
) {
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
          className={`form-input w-full appearance-none pr-10 ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        >
          {placeholder !== null && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
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
