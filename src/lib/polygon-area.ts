import type { GeoPoint } from '@/domain/property/property.entity';
import { formatNumber } from './format-number';

const EARTH_RADIUS_M = 6378137;
const SQUARE_METERS_PER_HECTARE = 10_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Superficie de un polígono sobre la esfera, en hectáreas — misma fórmula
 * que `L.GeometryUtil.geodesicArea` de Leaflet.draw (sin sumar esa
 * dependencia solo por esto). Precisión de sobra para una finca: el error
 * frente al elipsoide es < 0,5 %. Menos de 3 puntos → 0. */
export function polygonAreaHectares(points: GeoPoint[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    sum +=
      toRadians(next.lng - current.lng) *
      (2 + Math.sin(toRadians(current.lat)) + Math.sin(toRadians(next.lat)));
  }
  const squareMeters = Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  return squareMeters / SQUARE_METERS_PER_HECTARE;
}

export function formatHectares(points: GeoPoint[]): string {
  return `${formatNumber(polygonAreaHectares(points))} ha`;
}
