export interface KardexEntry {
  id: string;
  investmentId: string;
  entryDate: string;
  detail: string;
  avgWeight: number;
  entryQuantity: number;
  entryKilos: number;
  exitQuantity: number;
  exitKilos: number;
  balanceQuantity: number;
  balanceKilos: number;
  total: number;
  isDeleted: boolean;
  createdAt: string;
}

export type KardexEntryFields = Omit<KardexEntry, 'id' | 'investmentId' | 'isDeleted' | 'createdAt'>;

export interface CreateKardexEntryData extends KardexEntryFields {
  investmentId: string;
}

export type UpdateKardexEntryData = KardexEntryFields;
