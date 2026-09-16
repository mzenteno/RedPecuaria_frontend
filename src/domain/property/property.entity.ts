export interface Property {
  id: string;
  companyId: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

/** Forma mínima para un combo (`GET /properties/options`) — a propósito
 * NO `extends Property`: el backend solo manda `id`+`name` acá, nunca
 * `latitude`/`longitude`/`companyId`/`createdAt` (ver
 * `docs/property/changes/...`). Usado por Inversiones (combo "Propiedad")
 * y Kardex (nombre de la propiedad de cada inversión). */
export interface PropertyOption {
  id: string;
  name: string;
}

export type CreatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude'>;
export type UpdatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude'>;
