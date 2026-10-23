interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Para ajustar el contenedor cuando las pestañas comparten fila con
   * otros controles (ej. `border-b-0` si la fila ya lleva su propio borde). */
  className?: string;
}

/** Pestañas para alternar entre pocos estados mutuamente excluyentes (ej.
 * "Activas"/"Terminadas" en "Mis inversiones") — preferible a un combo
 * cuando son 2 o 3 opciones: todas quedan a la vista y se cambia con un
 * solo clic. Para un filtro con muchos valores, usar `Select`. */
export function Tabs<T extends string>({ options, value, onChange, className = '' }: TabsProps<T>) {
  return (
    <div role="tablist" className={`tabs ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`tab ${active ? 'tab-active' : ''}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
