import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Botón/ícono flotante a la derecha del input (ej. mostrar/ocultar contraseña). */
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, rightElement, ...props },
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
        <input
          ref={ref}
          id={id}
          className={`form-input ${rightElement ? 'pr-11' : ''} ${error ? 'form-input-error' : ''} ${className}`}
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
