interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Pestañas para alternar entre pocos estados mutuamente excluyentes (ej.
 * "Activas"/"Terminadas" en "Mis inversiones") — preferible a un combo
 * cuando son 2 o 3 opciones: todas quedan a la vista y se cambia con un
 * solo clic. Para un filtro con muchos valores, usar `Select`. */
export function Tabs<T extends string>({ options, value, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="tabs">
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
