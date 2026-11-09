import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from './format-date';
import { formatNumber } from './format-number';
import { loadCompanyLogo } from './pdf-logo';

export interface KardexPdfParams {
  propertyName: string;
  investmentDescription: string;
  gestion: number;
  /** 'kilo' o 'dinero' (`Investment.investmentTypeName`) — decide si las
   * columnas de Entrada/Salida/Saldo (y "Peso prom.") muestran kilos o
   * dinero, mismo criterio que `KardexTable`. */
  investmentTypeName: string;
  /** El Kardex ahora siempre es de UN inversionista puntual (a pedido del
   * usuario, 2026-10-14) — ya no tiene sentido una columna "Inversionista"
   * por fila (sería el mismo nombre en todas), así que se muestra una sola
   * vez en el encabezado. */
  investorName: string;
  entries: KardexEntryListItem[];
  /** `Company.logoUrl` de la empresa activa — hoy un `data:` URI en base64
   * (ver `docs/company/changes/2026-09-26-logo-en-base64-no-en-disco.md`),
   * pero esta función no asume esa forma en particular, cualquier URL que
   * `fetch()` sepa resolver sirve igual. `null` si esa empresa no tiene
   * logo cargado — el encabezado queda solo con texto (igual que antes de
   * que existiera esta opción). */
  companyLogoUrl: string | null;
}

const LOGO_MAX_WIDTH = 120;
const LOGO_MAX_HEIGHT = 40;
// Arriba del todo, a la altura del título (no entre el título y el bloque
// de datos, como en el primer intento) — mismo `X` que el bloque de datos
// de abajo (40), a pedido del usuario.
const LOGO_X = 40;
const LOGO_Y = 20;

/**
 * Arma el PDF calcando el layout de la planilla Excel de referencia
 * (docs/investment/investment.md): título, "Propiedad", el logo de la
 * empresa (si tiene uno cargado, arriba del bloque de datos — a pedido del
 * usuario, 2026-09-26), un bloque de datos (descripción/gestión/
 * inversionistas) y la tabla de movimientos con el mismo agrupamiento
 * Entrada/Salida/Saldo que la pantalla (ver `KardexTable`). Todo el cálculo
 * (saldo corrido, etc.) ya viene resuelto en `entries` — acá solo se da
 * vuelta a texto/tabla.
 *
 * Sin nombre de empresa en el encabezado (a pedido del usuario) — la
 * propiedad ya identifica de sobra la inversión.
 *
 * Async (antes no lo era) — cargar el logo es una descarga de red, tiene
 * que resolverse antes de `doc.save()`.
 */
export async function downloadKardexPdf(params: KardexPdfParams): Promise<void> {
  const { propertyName, investmentDescription, gestion, investmentTypeName, investorName, entries, companyLogoUrl } =
    params;
  const isDinero = investmentTypeName === 'dinero';

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KARDEX DE INVENTARIO DE GANADO', pageWidth / 2, 36, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`PROPIEDAD "${propertyName.toUpperCase()}"`, pageWidth / 2, 54, { align: 'center' });

  let infoY = 76;

  const logo = companyLogoUrl ? await loadCompanyLogo(companyLogoUrl) : null;
  if (logo) {
    const scale = Math.min(LOGO_MAX_WIDTH / logo.width, LOGO_MAX_HEIGHT / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    doc.addImage(logo.dataUrl, 'PNG', LOGO_X, LOGO_Y, logoWidth, logoHeight);
    // El logo ahora arranca a la altura del título, no ya pegado al bloque
    // de datos — `max()` evita que un logo más alto de lo esperado
    // (`LOGO_MAX_HEIGHT` es un techo, no un tamaño fijo) se superponga con
    // "Descripción/Gestión/Inversionistas".
    infoY = Math.max(infoY, LOGO_Y + logoHeight + 14);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const infoLines = [
    `Descripción: ${investmentDescription}`,
    `Gestión: ${gestion}`,
    `Inversionista: ${investorName}`,
  ];

  for (const line of infoLines) {
    doc.text(line, 40, infoY);
    infoY += 14;
  }

  const head = [
    [
      { content: 'Fecha', rowSpan: 2 },
      { content: 'Detalle', rowSpan: 2 },
      { content: isDinero ? 'Monto\nprom.' : 'Peso\nprom.', rowSpan: 2 },
      { content: 'Entrada', colSpan: 2 },
      { content: 'Salida', colSpan: 2 },
      { content: 'Saldo', colSpan: 2 },
      // Sin Debe/Haber (a pedido del usuario, 2026-11-08) — siguen en la
      // pantalla del Kardex, no en el PDF.
      { content: 'Firma', rowSpan: 2 },
    ],
    ['Cant.', isDinero ? 'Bs.' : 'Kilos', 'Cant.', isDinero ? 'Bs.' : 'Kilos', 'Cant.', isDinero ? 'Bs.' : 'Kilos'],
  ];

  const body = entries.map((entry) => {
    const isIngreso = entry.movementTypeName === 'ingreso';
    const isBaja = entry.movementTypeName === 'baja';
    const isVenta = entry.movementTypeName === 'venta';

    return [
      formatDateOnly(entry.entryDate),
      entry.detail,
      isBaja ? '' : formatNumber(entry.avgWeight),
      isIngreso ? String(entry.entryQuantity) : '',
      isIngreso ? formatNumber(isDinero ? entry.debe : entry.entryKilos) : '',
      isBaja || isVenta ? String(entry.exitQuantity) : '',
      isBaja ? formatNumber(entry.avgWeight) : isVenta ? formatNumber(isDinero ? entry.haber : entry.exitKilos) : '',
      String(entry.runningBalanceQuantity),
      formatNumber(isDinero ? entry.runningBalanceTotal : entry.runningBalanceKilos),
      '',
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: infoY + 8,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [47, 158, 68], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: 'left', cellWidth: 140 },
    },
  });

  doc.save(`kardex-${propertyName}-${gestion}.pdf`);
}
