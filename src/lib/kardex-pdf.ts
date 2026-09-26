import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from './format-date';
import { formatNumber } from './format-number';

export interface KardexPdfParams {
  propertyName: string;
  investmentDescription: string;
  gestion: number;
  /** 'kilo' o 'dinero' (`Investment.investmentTypeName`) — decide si las
   * columnas de Entrada/Salida/Saldo (y "Peso prom.") muestran kilos o
   * dinero, mismo criterio que `KardexTable`. */
  investmentTypeName: string;
  investors: { id: string; fullName: string }[];
  entries: KardexEntryListItem[];
  /** URL absoluta del logo de la empresa activa (`Company.logoUrl`, ver
   * `docs/company/changes/2026-09-26-logo-de-empresa.md`) — `null` si esa
   * empresa no tiene uno cargado, el encabezado queda solo con texto (igual
   * que antes de que existiera esta opción). */
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
 * Descarga la imagen del logo y la vuelve a dibujar en un `<canvas>` para
 * sacarla como PNG — no porque haga falta convertir el formato (`jsPDF` ya
 * acepta PNG/JPG/WEBP tal cual), sino porque un SVG (uno de los 4 formatos
 * permitidos al subir el logo) NO lo acepta `doc.addImage()` directamente;
 * pasar los 4 formatos por el mismo canvas evita bifurcar el código según
 * el mimetype. Convertir el `Blob` ya descargado a un `blob:` URL (nunca
 * reusar la URL http original como `src` del `<img>`) es lo que evita que
 * el canvas quede "tainted" por CORS: en ese punto la imagen ya está en
 * memoria como bytes propios del navegador, no un recurso remoto.
 *
 * Devuelve `null` ante cualquier error (red, CORS, archivo borrado) — un
 * logo roto no debe impedir descargar el PDF, solo se lo salta.
 */
async function loadCompanyLogo(
  url: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar el logo'));
        img.src = objectUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(image, 0, 0);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

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
  const { propertyName, investmentDescription, gestion, investmentTypeName, investors, entries, companyLogoUrl } =
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
    investors.length > 0 ? `Inversionistas: ${investors.map((investor) => investor.fullName).join(', ')}` : null,
  ].filter((line): line is string => line !== null);

  for (const line of infoLines) {
    doc.text(line, 40, infoY);
    infoY += 14;
  }

  const head = [
    [
      { content: 'Fecha', rowSpan: 2 },
      { content: 'Detalle', rowSpan: 2 },
      { content: 'Inversionista', rowSpan: 2 },
      { content: isDinero ? 'Monto\nprom.' : 'Peso\nprom.', rowSpan: 2 },
      { content: 'Entrada', colSpan: 2 },
      { content: 'Salida', colSpan: 2 },
      { content: 'Saldo', colSpan: 2 },
      { content: 'Debe', rowSpan: 2 },
      { content: 'Haber', rowSpan: 2 },
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
      entry.investorName ?? '',
      isBaja ? '' : formatNumber(entry.avgWeight),
      isIngreso ? String(entry.entryQuantity) : '',
      isIngreso ? formatNumber(isDinero ? entry.debe : entry.entryKilos) : '',
      isBaja || isVenta ? String(entry.exitQuantity) : '',
      isBaja ? formatNumber(entry.avgWeight) : isVenta ? formatNumber(isDinero ? entry.haber : entry.exitKilos) : '',
      String(entry.runningBalanceQuantity),
      formatNumber(isDinero ? entry.runningBalanceTotal : entry.runningBalanceKilos),
      isIngreso ? formatNumber(entry.debe) : '',
      isVenta || (isBaja && isDinero) ? formatNumber(entry.haber) : '',
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
      2: { halign: 'left', cellWidth: 90 },
    },
  });

  doc.save(`kardex-${propertyName}-${gestion}.pdf`);
}
