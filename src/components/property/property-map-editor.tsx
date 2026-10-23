'use client';

import { useEffect, useRef, useState } from 'react';
import { LayersControl, MapContainer, Marker, Polygon, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2, Trash2, Undo2 } from 'lucide-react';
import type { GeoPoint } from '@/domain/property/property.entity';
import { Tabs } from '@/components/ui/tabs';

// El ícono por defecto de Leaflet queda roto al empaquetarse con bundlers
// (busca las imágenes en una ruta relativa que no existe en el build de
// Next) — se reemplaza por las mismas imágenes servidas desde unpkg.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Vértice arrastrable del contorno — un cuadradito blanco, mismo estilo que
// los editores de polígonos habituales (Leaflet.draw, Google My Maps).
const vertexIcon = L.divIcon({
  className: '',
  html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #ff2d2d;box-shadow:0 0 0 1px #111;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Punto medio de cada lado: más chico y semitransparente que un vértice
// real. Clic o arrastre lo convierten en un vértice nuevo en ESE lado.
const midpointIcon = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;background:rgba(255,255,255,0.55);border:2px solid #ff2d2d;box-shadow:0 0 0 1px #111;opacity:0.85;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// Rojo intenso con un halo oscuro debajo (se dibuja dos veces, ver
// `BOUNDARY_HALO`): el rojo contrasta con el verde/marrón del satélite
// y el halo lo despega del fondo claro del mapa de calles — antes era el
// verde de la marca, que se perdía en ambos. Hex, no variables CSS: Leaflet
// lo escribe como atributo SVG `stroke`, donde no se resuelven.
const BOUNDARY_COLOR = '#ff2d2d';
const BOUNDARY_HALO = '#111111';
const HALO_OPTIONS = {
  color: BOUNDARY_HALO,
  weight: 6,
  opacity: 0.7,
  fill: false,
  interactive: false,
};

export type MapEditMode = 'location' | 'boundary';

const MODE_TABS = [
  { value: 'location', label: 'Ubicación' },
  { value: 'boundary', label: 'Contorno' },
] as const satisfies readonly { value: MapEditMode; label: string }[];

interface PropertyMapEditorProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  boundary: GeoPoint[];
  onBoundaryChange: (boundary: GeoPoint[]) => void;
  /** Alto del mapa fuera de pantalla completa (sin contar la barra de
   * modos). */
  height?: number;
}

function ClickHandler({ onClick }: { onClick: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      onClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

/**
 * Mapa de la propiedad con dos modos (a pedido del usuario, 2026-10-23):
 * - "Ubicación": clic mueve el marcador (lat/lng, ej. la entrada).
 * - "Contorno": cada clic en el mapa agrega un vértice AL FINAL del
 *   recorrido (entre el último y el primero) — sin límite de puntos. Para
 *   meter un vértice en un lado ya trazado está el punto medio de cada lado
 *   (clic o arrastre); clic derecho sobre un vértice lo borra. Los vértices
 *   se arrastran para ajustarlos. El polígono se cierra solo.
 *
 * Capa satelital por defecto (Esri World Imagery, gratuita y sin API key) —
 * para dibujar un contorno hace falta ver los alambrados/caminos, que en el
 * mapa de calles de OpenStreetMap no aparecen. OSM sigue disponible en el
 * selector de capas de la esquina.
 */
export function PropertyMapEditor({
  latitude,
  longitude,
  onLocationChange,
  boundary,
  onBoundaryChange,
  height = 520,
}: PropertyMapEditorProps) {
  const [mode, setMode] = useState<MapEditMode>('location');
  // Pantalla completa (a pedido del usuario, 2026-10-23) con la Fullscreen
  // API del navegador sobre TODO el editor (barra de modos + mapa), no un
  // overlay `position: fixed`: un `fixed` adentro del diálogo puede quedar
  // atrapado por el contenedor, y la API ya trae "Esc para salir".
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange(): void {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      // Leaflet calcula el tamaño del mapa una sola vez — si el contenedor
      // cambia de tamaño hay que avisarle, si no quedan franjas grises sin
      // tiles. Al siguiente frame, cuando el layout nuevo ya se aplicó.
      requestAnimationFrame(() => mapRef.current?.invalidateSize());
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  function toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  }
  // Vista inicial fija (no sigue a las props si cambian después) — el
  // diálogo se remonta entero al abrirse (`key={sessionId}`). Si ya hay
  // contorno, se encuadra la propiedad completa en vez de centrar en el
  // punto. `useState` con inicializador perezoso: un ref no debe leerse
  // durante el render, un estado sí.
  const [initialView] = useState(() =>
    boundary.length >= 3
      ? {
          bounds: L.latLngBounds(boundary.map((point) => [point.lat, point.lng])),
        }
      : { center: [latitude, longitude] as [number, number], zoom: 15 },
  );

  function handleMapClick(point: GeoPoint): void {
    if (mode === 'location') {
      onLocationChange(point.lat, point.lng);
    } else {
      onBoundaryChange([...boundary, point]);
    }
  }

  function moveVertex(index: number, point: GeoPoint): void {
    onBoundaryChange(boundary.map((current, i) => (i === index ? point : current)));
  }

  function insertVertex(index: number, point: GeoPoint): void {
    onBoundaryChange([...boundary.slice(0, index), point, ...boundary.slice(index)]);
  }

  function removeVertex(index: number): void {
    onBoundaryChange(boundary.filter((_, i) => i !== index));
  }

  // Un punto medio por lado: con 2 vértices hay un solo lado; desde 3, el
  // polígono está cerrado y el último lado va del último vértice al primero.
  // `insertAt` es dónde queda el vértice nuevo (justo después del inicio del
  // lado).
  const edgeCount = boundary.length >= 3 ? boundary.length : boundary.length === 2 ? 1 : 0;
  const midpoints = Array.from({ length: edgeCount }, (_, i) => {
    const start = boundary[i];
    const end = boundary[(i + 1) % boundary.length];
    return {
      insertAt: i + 1,
      point: { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
    };
  });

  const positions = boundary.map((point) => [point.lat, point.lng] as [number, number]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col border"
      style={{
        borderColor: 'var(--border-input)',
        background: 'var(--bg-card)',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b pr-3"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Tabs options={MODE_TABS} value={mode} onChange={setMode} className="border-b-0" />
        <div className="flex items-center gap-1">
          {mode === 'boundary' && (
            <>
              <button
                type="button"
                onClick={() => onBoundaryChange(boundary.slice(0, -1))}
                disabled={boundary.length === 0}
                className="data-action-btn disabled:opacity-40"
                aria-label="Deshacer último punto"
                title="Deshacer último punto"
              >
                <Undo2 className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => onBoundaryChange([])}
                disabled={boundary.length === 0}
                className="data-action-btn disabled:opacity-40"
                aria-label="Borrar contorno"
                title="Borrar contorno"
              >
                <Trash2 className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="data-action-btn"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Maximize2 className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      {/* En pantalla completa el mapa ocupa todo lo que deja la barra de
          arriba (`flex-1` + `min-h-0`), en vez de los 520px fijos. */}
      <div
        className={isFullscreen ? 'min-h-0 flex-1' : undefined}
        style={{
          height: isFullscreen ? undefined : height,
          cursor: mode === 'boundary' ? 'crosshair' : undefined,
        }}
      >
        <MapContainer ref={mapRef} {...initialView} style={{ height: '100%', width: '100%', cursor: 'inherit' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satélite">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={20}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Mapa">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={20}
                maxNativeZoom={19}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Fuera de `LayersControl`: se dibuja igual sobre cualquier capa
              base (Satélite o Mapa). */}
          {positions.length >= 3 && (
            <>
              <Polygon positions={positions} pathOptions={HALO_OPTIONS} />
              <Polygon
                positions={positions}
                pathOptions={{
                  color: BOUNDARY_COLOR,
                  weight: 3,
                  fillOpacity: 0.15,
                }}
              />
            </>
          )}
          {/* Con 2 puntos todavía no hay superficie — se muestra el tramo
              para que se vea por dónde va el trazo. */}
          {positions.length === 2 && (
            <>
              <Polyline positions={positions} pathOptions={HALO_OPTIONS} />
              <Polyline positions={positions} pathOptions={{ color: BOUNDARY_COLOR, weight: 3 }} />
            </>
          )}

          {/* Los vértices solo se muestran (y se arrastran) en modo
              Contorno — en Ubicación taparían el mapa sin servir de nada. */}
          {mode === 'boundary' &&
            boundary.map((point, index) => (
              <Marker
                // El índice ES la identidad del vértice (no hay id propio) y
                // el orden solo cambia al deshacer el último, que no
                // reordena los demás.
                key={index}
                position={[point.lat, point.lng]}
                icon={vertexIcon}
                draggable
                eventHandlers={{
                  drag: (event) => {
                    const latLng = (event.target as L.Marker).getLatLng();
                    moveVertex(index, { lat: latLng.lat, lng: latLng.lng });
                  },
                  contextmenu: () => removeVertex(index),
                }}
              />
            ))}
          {mode === 'boundary' &&
            midpoints.map(({ insertAt, point }) => (
              <Marker
                // Clave atada a la cantidad de vértices: al insertar, todos
                // los puntos medios se recalculan y se remontan limpios
                // (incluido el que se estaba arrastrando).
                key={`mid-${insertAt}-${boundary.length}`}
                position={[point.lat, point.lng]}
                icon={midpointIcon}
                draggable
                eventHandlers={{
                  click: () => insertVertex(insertAt, point),
                  dragend: (event) => {
                    const latLng = (event.target as L.Marker).getLatLng();
                    insertVertex(insertAt, {
                      lat: latLng.lat,
                      lng: latLng.lng,
                    });
                  },
                }}
              />
            ))}

          <Marker position={[latitude, longitude]} icon={markerIcon} />
          <ClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  );
}
