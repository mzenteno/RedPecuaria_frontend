'use client';

import Select, { type MultiValue, type StylesConfig } from 'react-select';

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface ReactSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
}

function buildStyles(hasError: boolean): StylesConfig<ReactSelectOption, true> {
  return {
    container: (base) => ({ ...base, width: '100%' }),
    control: (base, state) => ({
      ...base,
      minHeight: '2.625rem',
      background: 'var(--bg-card)',
      borderColor: hasError ? 'var(--danger)' : state.isFocused ? 'var(--primary)' : 'var(--border-input)',
      boxShadow: state.isFocused
        ? `0 0 0 3px color-mix(in srgb, ${hasError ? 'var(--danger)' : 'var(--primary)'} 15%, transparent)`
        : 'none',
      ':hover': { borderColor: hasError ? 'var(--danger)' : 'var(--border-input)' },
    }),
    valueContainer: (base) => ({ ...base, padding: '0.25rem 0.5rem', gap: '0.375rem' }),
    placeholder: (base) => ({ ...base, color: 'var(--text-placeholder)', fontSize: '0.875rem' }),
    input: (base) => ({ ...base, color: 'var(--foreground)', fontSize: '0.875rem', margin: 0, padding: 0 }),
    multiValue: (base) => ({
      ...base,
      border: '1px solid var(--primary)',
      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--foreground)',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--primary)',
      ':hover': { background: 'transparent', opacity: 0.7, color: 'var(--primary)' },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
      ...base,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-input)',
    }),
    menuList: (base) => ({ ...base, maxHeight: '14rem' }),
    option: (base, state) => ({
      ...base,
      fontSize: '0.875rem',
      cursor: 'pointer',
      background: state.isFocused ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
      color: 'var(--foreground)',
    }),
    noOptionsMessage: (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '0.75rem' }),
    loadingMessage: (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '0.75rem' }),
    indicatorSeparator: (base) => ({ ...base, display: 'none' }),
    dropdownIndicator: (base) => ({ ...base, color: 'var(--text-muted)' }),
    clearIndicator: (base) => ({ ...base, color: 'var(--text-muted)' }),
  };
}

/**
 * Selector múltiple con chips + búsqueda, sobre `react-select` — un
 * combobox hecho a mano (versión anterior de este mismo archivo) manejaba
 * mal foco/teclado/click-afuera; `react-select` ya lo resuelve de forma
 * madura, solo hace falta re-estilarlo para que se vea como el resto del
 * design system (vía `styles`, no clases, mismo criterio que `Input`/
 * `Select` de este mismo directorio, que también fijan sus colores con
 * `var(--...)` en vez de clases sueltas). El resto del proyecto sigue
 * hablando en `id`/`label` y `string[]` — el mapeo a la forma que pide la
 * librería (`{value, label}`) queda encapsulado acá adentro.
 *
 * `menuPortalTarget={document.body}` — sin esto, el desplegable queda
 * recortado por el `overflow-y-auto` del diálogo que lo contiene (ver
 * `.dialog-panel-lg` en `globals.css`) en vez de flotar por encima de todo.
 */
export function MultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  loading = false,
  disabled = false,
  error,
  placeholder = 'Selecciona uno o más valores',
  emptyMessage = 'Sin resultados',
}: MultiSelectProps) {
  const selectOptions: ReactSelectOption[] = options.map((option) => ({ value: option.id, label: option.label }));
  const value = selectOptions.filter((option) => selectedIds.includes(option.value));

  function handleChange(selected: MultiValue<ReactSelectOption>): void {
    onChange(selected.map((option) => option.value));
  }

  return (
    <div>
      {label && <label className="tipo-label">{label}</label>}
      <Select<ReactSelectOption, true>
        isMulti
        isLoading={loading}
        isDisabled={disabled}
        options={selectOptions}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        noOptionsMessage={() => emptyMessage}
        loadingMessage={() => 'Cargando...'}
        styles={buildStyles(Boolean(error))}
        menuPortalTarget={typeof window === 'undefined' ? undefined : document.body}
        classNamePrefix="rs"
      />
      {error && <p className="tipo-error">{error}</p>}
    </div>
  );
}
