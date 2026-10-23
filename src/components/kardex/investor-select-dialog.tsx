'use client';

import type { UserOption } from '@/domain/user/user.entity';
import { Button } from '@/components/ui/button';

interface InvestorSelectDialogProps {
  investors: UserOption[];
  onSelect: (investorUserId: string) => void;
  onCancel: () => void;
}

/**
 * Paso intermedio del atajo "Ver kardex" desde Inversiones (a pedido del
 * usuario, 2026-10-14): se muestra SIEMPRE, incluso con un solo
 * inversionista — a diferencia de "Mis inversiones" (`kardex/page.tsx`,
 * `openMyInvestment`), donde no hay nada que elegir porque el único
 * inversionista posible es uno mismo.
 *
 * Un diálogo (no una pantalla propia) porque es un único paso de selección,
 * no una sección navegable — mismo criterio que `CompanySelectDialog`
 * (elegir empresa al loguearse), aunque acá la lista es de filas
 * clickeables en vez de un `<select>`, porque elegir YA selecciona (no hace
 * falta un botón de confirmar aparte).
 */
export function InvestorSelectDialog({ investors, onSelect, onCancel }: InvestorSelectDialogProps) {
  return (
    <div className="dialog-overlay">
      {/* `.data-table` trae `min-width: 40rem` fijo (pensado para tablas de
          varias columnas) — con el ancho por defecto del diálogo
          (`max-w-md`, 28rem) esa tabla de una sola columna quedaba forzando
          scroll horizontal. Se ensancha el panel en vez de dejar de usar
          `.data-table`, mismo criterio que `KardexEntryDialog`
          (`style={{ maxWidth }}` sobre `.dialog-panel`). */}
      <div className="dialog-panel flex flex-col gap-6" style={{ maxWidth: '44rem' }}>
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">Selecciona un inversionista</h2>
          <p className="tipo-secundario">Elegí de quién querés ver el Kardex.</p>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.id} onClick={() => onSelect(investor.id)} className="cursor-pointer">
                  <td>{investor.fullName}</td>
                </tr>
              ))}
              {investors.length === 0 && (
                <tr>
                  <td className="data-table-empty">Esta inversión no tiene inversionistas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dialog-footer">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
