import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** Si no se pasa, no se muestra el botón "Cancelar" — para un aviso de
   * solo-un-botón (ej. un error), no una confirmación de dos pasos. */
  onCancel?: () => void;
}

/**
 * Mismos bloques que `CompanyDialog` (`.dialog-overlay`/`.dialog-panel`/
 * `.dialog-footer`) — a propósito, en vez de una librería de alertas: así un
 * diálogo de confirmación se ve exactamente igual al resto de los diálogos
 * de la app, no "parecido" (pelear contra el CSS propio de una librería para
 * que coincida es frágil y nunca queda idéntico).
 *
 * El botón de confirmar siempre es `primary` (verde) — también para acciones
 * como "Eliminar": es la regla del proyecto (ver ARCHITECTURE.md §2), no hay
 * una variante roja/destructiva.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{title}</h2>
          <p className="tipo-secundario">{description}</p>
        </div>

        <div className="dialog-footer">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
