/** Vértice del contorno de una propiedad, en grados decimales. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  companyId: string;
  name: string;
  /** Punto de ubicación — se marca aparte del contorno (ej. la entrada). */
  latitude: number;
  longitude: number;
  /** Contorno (perímetro) de la propiedad, `null` si todavía no se dibujó.
   * El polígono se cierra solo: el último vértice no repite al primero. */
  boundary: GeoPoint[] | null;
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

export type CreatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude' | 'boundary'>;
export type UpdatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude' | 'boundary'>;
