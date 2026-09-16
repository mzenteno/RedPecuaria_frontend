import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { KardexEntryListItem } from '@/domain/kardex/kardex-entry.entity';
import { formatDateOnly } from './format-date';
import { formatNumber } from './format-number';

export interface KardexPdfParams {
  propertyName: string;
  investmentDescription: string;
  gestion: number;
  investors: { id: string; fullName: string }[];
  entries: KardexEntryListItem[];
}

/**
 * Arma el PDF calcando el layout de la planilla Excel de referencia
 * (docs/investment/investment.md): título, "Propiedad", un bloque de datos
 * (descripción/gestión/inversionistas) y la tabla de movimientos con el
 * mismo agrupamiento Entrada/Salida/Saldo que la pantalla (ver
 * `KardexTable`). Todo el cálculo (saldo corrido, etc.) ya viene resuelto en
 * `entries` — acá solo se da vuelta a texto/tabla.
 *
 * Sin logo de empresa: la app no tiene un feature de "subir logo" todavía,
 * así que el encabezado queda solo con texto. Sin nombre de empresa (a
 * pedido del usuario) — la propiedad ya identifica de sobra la inversión.
 */
export function downloadKardexPdf(params: KardexPdfParams): void {
  const { propertyName, investmentDescription, gestion, investors, entries } = params;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KARDEX DE INVENTARIO DE GANADO', pageWidth / 2, 36, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`PROPIEDAD "${propertyName.toUpperCase()}"`, pageWidth / 2, 54, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const infoLines = [
    `Descripción: ${investmentDescription}`,
    `Gestión: ${gestion}`,
    investors.length > 0 ? `Inversionistas: ${investors.map((investor) => investor.fullName).join(', ')}` : null,
  ].filter((line): line is string => line !== null);

  let infoY = 76;
  for (const line of infoLines) {
    doc.text(line, 40, infoY);
    infoY += 14;
  }

  const head = [
    [
      { content: 'Fecha', rowSpan: 2 },
      { content: 'Detalle', rowSpan: 2 },
      { content: 'Inversionista', rowSpan: 2 },
      { content: 'Peso\nprom.', rowSpan: 2 },
      { content: 'Entrada', colSpan: 2 },
      { content: 'Salida', colSpan: 2 },
      { content: 'Saldo', colSpan: 2 },
      { content: 'Debe', rowSpan: 2 },
      { content: 'Haber', rowSpan: 2 },
      { content: 'Firma', rowSpan: 2 },
    ],
    ['Cant.', 'Kilos', 'Cant.', 'Kilos', 'Cant.', 'Kilos'],
  ];

  const body = entries.map((entry) => {
    const isIngreso = entry.movementTypeName === 'ingreso';
    const isBaja = entry.movementTypeName === 'baja';
    const isVenta = entry.movementTypeName === 'venta';

    return [
      formatDateOnly(entry.entryDate),
      entry.detail,
      entry.investorName ?? '',
      formatNumber(entry.avgWeight),
      isIngreso ? String(entry.entryQuantity) : '-',
      isIngreso ? formatNumber(entry.entryKilos) : '-',
      isBaja || isVenta ? String(entry.exitQuantity) : '-',
      isVenta ? formatNumber(entry.exitKilos) : '-',
      String(entry.runningBalanceQuantity),
      formatNumber(entry.runningBalanceKilos),
      formatNumber(entry.debe),
      formatNumber(entry.haber),
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
