import { forwardRef, useRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Botón/ícono flotante a la derecha del input (ej. mostrar/ocultar contraseña). */
  rightElement?: ReactNode;
}

/** Campos numéricos: `type="number"` o los de texto con teclado numérico
 * (`FormattedNumberInput` usa `inputMode="decimal"`). */
function isNumericInput(props: InputHTMLAttributes<HTMLInputElement>): boolean {
  return props.type === 'number' || props.inputMode === 'decimal' || props.inputMode === 'numeric';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, rightElement, onFocus, onMouseDown, onMouseUp, ...props },
  ref,
) {
  // Al entrar a un campo numérico se selecciona todo su contenido (a pedido
  // del usuario, 2026-11-10): así el "0,00" inicial se reemplaza tipeando
  // directo, sin tener que borrarlo antes. Dos detalles del navegador:
  // - `requestAnimationFrame`: `FormattedNumberInput` cambia el valor al
  //   enfocarse ("1.000,00" → "1000.00"); seleccionar en el mismo evento
  //   seleccionaría el texto viejo.
  // - Entrando con clic, el `mouseup` posterior ubica el cursor y deshace la
  //   selección — se cancela solo el `mouseup` del clic que entró al campo.
  const selectAll = isNumericInput(props);
  const ignoreNextMouseUp = useRef(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="tipo-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={`form-input ${rightElement ? 'pr-11' : ''} ${error ? 'form-input-error' : ''} ${className}`}
          onFocus={(event) => {
            onFocus?.(event);
            if (selectAll) {
              const target = event.currentTarget;
              requestAnimationFrame(() => target.select());
            }
          }}
          onMouseDown={(event) => {
            onMouseDown?.(event);
            // Solo el clic que ENTRA al campo (no uno estando ya adentro,
            // que sí debe poder ubicar el cursor).
            ignoreNextMouseUp.current = selectAll && document.activeElement !== event.currentTarget;
          }}
          onMouseUp={(event) => {
            onMouseUp?.(event);
            if (ignoreNextMouseUp.current) {
              ignoreNextMouseUp.current = false;
              event.preventDefault();
            }
          }}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center px-3">{rightElement}</div>
        )}
      </div>
      {error && <p className="tipo-error">{error}</p>}
    </div>
  );
});
