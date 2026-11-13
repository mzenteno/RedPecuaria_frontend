import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KardexEntry } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from './format-date';
import { formatCountOrDash, formatNumber, formatNumberOrDash } from './format-number';
import { loadCompanyLogo } from './pdf-logo';

export type LiquidationKind = 'compra' | 'venta';

export interface LiquidationPdfParams {
  /** Ingreso → 'compra', Venta → 'venta' (Baja no tiene liquidación). */
  kind: LiquidationKind;
  /** El detalle completo del movimiento (`GET /kardex-entries/:id`) — el
   * listado no trae precio ni gastos. */
  entry: KardexEntry;
  investorName: string;
  propertyName: string;
  /** Ver `KardexPdfParams.companyLogoUrl`. */
  companyLogoUrl: string | null;
  /** `Investment.investorSharePercent` — % de la ganancia de kilos para el
   * inversionista en la distribución de la venta. `null` = sin definir (la
   * participación queda en blanco). */
  investorSharePercent: number | null;
}

const MARGIN_X = 40;
const LOGO_MAX_WIDTH = 140;
const LOGO_MAX_HEIGHT = 55;
const LOGO_Y = 20;
const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];


/**
 * Liquidación de compra (Ingreso) o de venta (Venta) de UN movimiento del
 * Kardex — calca las planillas Excel que usaba el usuario (2026-10-26).
 *
 * - "Monto" = total − comisión − transporte − otros gastos: en modo "kilo" es
 *   kilos × precio por kilo, en modo "dinero" la Entrada/Salida en Bs.; así
 *   sirve igual para ambos modos y para movimientos previos a los gastos.
 * - "Total Bs." de la tabla = monto + comisión; "Líquido pagable" = total
 *   del movimiento (con transporte y otros gastos).
 * - "Desb. X%" = desbaste en kg ("-" si es 0); desde 2026-11-11 el usuario
 *   tipea el % y el encabezado lo muestra. Igual "Comisión X%". "Peso net" = peso tot − desbaste, y el
 *   peso promedio se calcula sobre el peso neto. Antes de existir el dato iba
 *   siempre "-" y
 *   "Peso net" = "Peso tot".
 * - La venta lleva al pie la distribución de kilos entre inversionista y
 *   propiedad SOLO como estructura vacía (a pedido del usuario, los datos se
 *   definen más adelante).
 */
export async function downloadLiquidationPdf(params: LiquidationPdfParams): Promise<void> {
  const { kind, entry, investorName, propertyName, companyLogoUrl } = params;
  const isCompra = kind === 'compra';

  const quantity = isCompra ? entry.entryQuantity : entry.exitQuantity;
  const kilos = isCompra ? entry.entryKilos : entry.exitKilos;
  const shrinkage = entry.shrinkageKilos;
  const netKilos = kilos - shrinkage;
  const amount = entry.total - entry.commission - entry.transport - entry.otherExpenses;
  const tableTotal = amount + entry.commission;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightX = pageWidth - MARGIN_X;
  const centerX = pageWidth / 2;

  const logo = companyLogoUrl ? await loadCompanyLogo(companyLogoUrl) : null;
  if (logo) {
    const scale = Math.min(LOGO_MAX_WIDTH / logo.width, LOGO_MAX_HEIGHT / logo.height);
    doc.addImage(logo.dataUrl, 'PNG', MARGIN_X + 20, LOGO_Y, logo.width * scale, logo.height * scale);
  }

  // Título subrayado + subtítulo.
  const title = isCompra ? 'LIQUIDACIÓN DE COMPRA' : 'LIQUIDACIÓN DE VENTA';
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, centerX, 72, { align: 'center' });
  const titleWidth = doc.getTextWidth(title);
  doc.setLineWidth(1);
  doc.line(centerX - titleWidth / 2, 75, centerX + titleWidth / 2, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Liquidación en Bolivianos', centerX, 90, { align: 'center' });

  // Cliente (izquierda) / Propiedad (derecha).
  doc.setFontSize(10);
  doc.text('CLIENTE:', MARGIN_X, 116);
  doc.text(investorName, MARGIN_X + 60, 116);
  doc.text('PROPIEDAD:', rightX - 210, 116);
  doc.text(propertyName, rightX - 135, 116);

  const tableStyles = {
    theme: 'grid' as const,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: BLACK,
      lineColor: BLACK,
      lineWidth: 0.8,
      valign: 'middle' as const,
    },
    headStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold' as const, halign: 'center' as const },
    footStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold' as const },
  };

  autoTable(doc, {
    ...tableStyles,
    startY: 128,
    margin: { left: MARGIN_X, right: MARGIN_X },
    // El % real de cada movimiento en el encabezado (2026-11-11).
    head: [
      [
        'FECHA',
        'DETALLE',
        'CANT',
        'PESO TOT',
        entry.shrinkagePercent > 0 ? `DESB ${formatPercent(entry.shrinkagePercent)}` : 'DESB',
        'PESO NET',
        'PRECIO',
        'MONTO',
        entry.commissionPercent > 0 ? `COMISIÓN ${formatPercent(entry.commissionPercent)}` : 'COMISIÓN',
        'TOTAL BS',
      ],
    ],
    body: [
      [
        formatDateOnly(entry.entryDate),
        entry.detail,
        formatCountOrDash(quantity),
        formatNumberOrDash(kilos),
        formatNumberOrDash(shrinkage),
        formatNumberOrDash(netKilos),
        formatNumberOrDash(entry.pricePerKilo),
        formatNumberOrDash(amount),
        formatNumberOrDash(entry.commission),
        formatNumberOrDash(tableTotal),
      ],
    ],
    foot: [
      [
        '',
        '',
        formatCountOrDash(quantity),
        '',
        '',
        formatNumberOrDash(netKilos),
        formatNumberOrDash(entry.pricePerKilo),
        formatNumberOrDash(amount),
        '',
        formatNumberOrDash(tableTotal),
      ],
    ],
    columnStyles: {
      0: { halign: 'center', cellWidth: 62 },
      1: { halign: 'left', cellWidth: 150 },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
      9: { halign: 'right' },
    },
    // "-" centrado (como la planilla). En la fila de totales, sin bordes en
    // las celdas vacías (Fecha/Detalle/Desb./Comisión).
    didParseCell: (data) => {
      if (data.section === 'body' && data.cell.raw === '-') {
        data.cell.styles.halign = 'center';
      }
      if (data.section === 'foot') {
        data.cell.styles.halign = data.column.index === 2 ? 'center' : 'right';
        if (data.cell.raw === '') {
          data.cell.styles.lineWidth = 0;
        }
      }
    },
  });

  let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22;

  // Peso promedio por cabeza (solo si hay kilos — en modo "dinero" no).
  if (netKilos > 0 && quantity > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Peso promedio: ${formatNumberOrDash(netKilos / quantity)} Kg.`, centerX, y, { align: 'center' });
    y += 24;
  }

  // Gastos que no van en la tabla (solo los que tengan monto).
  doc.setFontSize(10);
  const extraLines: [string, number][] = [
    // Texto que tipeó el usuario en el movimiento (2026-11-10); vacío =
    // texto fijo.
    [entry.transportDescription.trim() || 'Costo de transporte', entry.transport],
    [entry.otherExpensesDescription.trim() || 'Otros gastos', entry.otherExpenses],
  ];
  // El texto puede ser largo (hasta 255 caracteres): se parte en renglones
  // para no pisar el monto de la derecha.
  const labelMaxWidth = rightX - MARGIN_X - 140;
  for (const [label, value] of extraLines) {
    if (value === 0) continue;
    const labelLines = doc.splitTextToSize(label, labelMaxWidth) as string[];
    doc.text(labelLines, MARGIN_X, y);
    doc.text(`${formatNumberOrDash(value)}  Bs.`, rightX, y, { align: 'right' });
    y += 20 + (labelLines.length - 1) * 12;
  }

  // Líquido pagable — recuadro de borde grueso en la mitad derecha.
  y += 14;
  const boxX = centerX - 60;
  const boxHeight = 24;
  doc.setLineWidth(1.8);
  doc.rect(boxX, y, rightX - boxX, boxHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const boxTextY = y + boxHeight / 2 + 4.5;
  doc.text('LÍQUIDO PAGABLE', boxX + (rightX - boxX) * 0.35, boxTextY, { align: 'center' });
  doc.text(`${formatNumberOrDash(entry.total)}  Bs.`, rightX - 8, boxTextY, { align: 'right' });
  y += boxHeight;

  // Costo/ingreso por cabeza, debajo del recuadro.
  if (quantity > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${formatNumberOrDash(entry.total / quantity)} Bs.`, rightX - 8, y + 12, { align: 'right' });
  }

  if (!isCompra) {
    drawSaleDistribution(doc, y + 44, tableStyles, {
      quantity,
      netKilos,
      initialWeightPerHead: entry.initialWeightPerHead,
      sharePercent: params.investorSharePercent,
      price: entry.pricePerKilo,
      distributionCommission: entry.distributionCommission,
      feedCost: entry.feedCost,
    });
  }

  const fileDate = entry.entryDate.replaceAll('-', '');
  doc.save(`liquidacion-${kind}-${fileDate}-${investorName.replaceAll(' ', '_')}.pdf`);
}

interface SaleDistribution {
  quantity: number;
  /** Peso neto de la venta (kilos de salida − desbaste). */
  netKilos: number;
  /** Peso con el que entró cada animal — se tipea en la Venta. 0 = sin
   * cargar: la devolución/ganancia y el reparto quedan en blanco. */
  initialWeightPerHead: number;
  sharePercent: number | null;
  price: number;
  distributionCommission: number;
  feedCost: number;
}

const SHADE: [number, number, number] = [217, 217, 217];

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : formatNumber(value)}%`;
}

/**
 * Pie de la liquidación de venta (2026-11-09) — reparto de la ganancia de
 * kilos entre inversionista y propiedad, calcado de la planilla Excel:
 *
 * - Peso neto de venta = kilos de salida − desbaste (unitario: ÷ cabezas).
 * - Devolución al inversionista = peso inicial por cabeza × cabezas.
 * - Ganancia en la propiedad = peso neto − devolución.
 * - Kg. ganados: ganancia × % del inversionista / × % de la propiedad.
 * - Tot Kg. del inversionista = devolución + sus kg. ganados.
 * - Tot. Bs. del inversionista = Tot Kg. × precio − comisión − alimento. La
 *   propiedad no cobra en Bs. (se queda con sus kilos): "-".
 *
 * Lo que falte (peso inicial o % de participación) queda en blanco.
 */
function drawSaleDistribution(
  doc: jsPDF,
  startY: number,
  tableStyles: Pick<Parameters<typeof autoTable>[1], 'theme' | 'styles' | 'headStyles' | 'footStyles'>,
  data: SaleDistribution,
): void {
  const { quantity, netKilos, initialWeightPerHead, sharePercent, price, distributionCommission, feedCost } = data;
  const perHead = (value: number) => (quantity > 0 ? formatNumberOrDash(value / quantity) : '');

  const hasInitialWeight = initialWeightPerHead > 0;
  const returnedKilos = initialWeightPerHead * quantity;
  const gainKilos = netKilos - returnedKilos;
  const canSplit = hasInitialWeight && sharePercent !== null;
  const investorGain = canSplit ? (gainKilos * (sharePercent as number)) / 100 : 0;
  const propertyGain = gainKilos - investorGain;
  const investorTotalKilos = returnedKilos + investorGain;
  const investorTotalBs = investorTotalKilos * price - distributionCommission - feedCost;

  const labelX = MARGIN_X;
  const totalX = 400;
  const unitX = 490;
  let y = startY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Total', totalX, y, { align: 'right' });
  doc.text('Unitario', unitX, y, { align: 'right' });
  doc.setLineWidth(0.6);
  doc.line(totalX - doc.getTextWidth('Total'), y + 2, totalX, y + 2);
  doc.line(unitX - doc.getTextWidth('Unitario'), y + 2, unitX, y + 2);

  const rows: [string, string, string][] = [
    ['Peso neto de venta', formatNumberOrDash(netKilos), perHead(netKilos)],
    [
      'Devolución de kilos al inversionista',
      hasInitialWeight ? formatNumberOrDash(returnedKilos) : '',
      hasInitialWeight ? formatNumberOrDash(initialWeightPerHead) : '',
    ],
    [
      'Ganancia de kilos en la propiedad',
      hasInitialWeight ? formatNumberOrDash(gainKilos) : '',
      hasInitialWeight ? perHead(gainKilos) : '',
    ],
  ];
  for (const [label, total, unit] of rows) {
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.text(label, labelX, y);
    doc.text(unit, unitX, y, { align: 'right' });
    doc.text('Kg.', unitX + 6, y);
    doc.setFont('helvetica', 'bold');
    doc.text(total, totalX, y, { align: 'right' });
  }
  doc.setFont('helvetica', 'normal');
  // Línea de resta entre "Devolución" y "Ganancia" — bajo las DOS columnas
  // (Total y Unitario), como la planilla.
  doc.line(totalX - 70, y - 11, unitX, y - 11);

  const dashOrBlank = (value: number) => formatNumberOrDash(value);
  autoTable(doc, {
    ...tableStyles,
    startY: y + 22,
    margin: { left: 300 },
    tableWidth: 470,
    head: [['', 'Particip.', 'Kg. Ganad', 'Tot Kg.', 'Precio', 'Comisión', 'Alimento', 'Tot. Bs.']],
    body: [
      [
        'Inversionista',
        sharePercent !== null ? formatPercent(sharePercent) : '',
        canSplit ? formatNumberOrDash(investorGain) : '',
        canSplit ? formatNumberOrDash(investorTotalKilos) : '',
        dashOrBlank(price),
        dashOrBlank(distributionCommission),
        dashOrBlank(feedCost),
        canSplit ? formatNumberOrDash(investorTotalBs) : '',
      ],
      ['', '', '', '', '', '', '', ''],
      [
        'Propiedad',
        sharePercent !== null ? formatPercent(100 - sharePercent) : '',
        canSplit ? formatNumberOrDash(propertyGain) : '',
        '',
        dashOrBlank(price),
        '-',
        '-',
        '-',
      ],
    ],
    headStyles: { ...tableStyles.headStyles, fontStyle: 'normal' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 75 },
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    didParseCell: (cell) => {
      // Fila del inversionista sombreada (como la planilla) y "-" centrado.
      if (cell.section === 'body' && cell.row.index === 0) {
        cell.cell.styles.fillColor = SHADE;
      }
      if (cell.section === 'body' && cell.cell.raw === '-') {
        cell.cell.styles.halign = 'center';
      }
    },
  });
}
