'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CompanyChoice } from '@/domain/auth/auth.entity';
import { Button } from '@/components/ui/button';

interface CompanySelectDialogProps {
  choices: CompanyChoice[];
  onSelect: (companyId: string) => void;
  onCancel: () => void;
}

/**
 * El usuario tiene más de una empresa activa (`CompanySelectionRequiredException`)
 * — no es un error, es un paso pendiente del login: hay que elegir con cuál
 * entrar. Usa las clases `.dialog-*`/`.form-input` del sistema de diseño en
 * vez de una librería de alertas genérica, porque esto necesita una lista
 * dinámica de opciones, no solo mostrar un texto.
 */
export function CompanySelectDialog({ choices, onSelect, onCancel }: CompanySelectDialogProps) {
  const [selected, setSelected] = useState(choices[0]?.companyId ?? '');

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">Selecciona una empresa</h2>
          <p className="tipo-secundario">Tu usuario tiene acceso a más de una empresa.</p>
        </div>

        <div className="relative">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="form-input w-full appearance-none pr-10"
          >
            {choices.map((choice) => (
              <option key={choice.companyId} value={choice.companyId}>
                {choice.companyName}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>

        <div className="dialog-footer">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSelect(selected)} disabled={!selected}>
            Ingresar
          </Button>
        </div>
      </div>
    </div>
  );
}
