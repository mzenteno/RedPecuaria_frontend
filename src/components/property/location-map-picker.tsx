'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/**
 * Selector de ubicación gratuito (OpenStreetMap vía Leaflet, sin API key)
 * — clic en el mapa mueve el marcador y reporta lat/lng. "Ver en Google
 * Maps" (en `PropertyDialog`) es solo un link con esas coordenadas, no un
 * embed de Google — evita cualquier costo/cuenta de Google Cloud.
 */
export function LocationMapPicker({ latitude, longitude, onChange }: LocationMapPickerProps) {
  // Centro inicial fijo (no sigue `latitude`/`longitude` si cambian después
  // del primer render) — el diálogo ya se remonta entero al abrirse (mismo
  // `key={sessionId}` que el resto de los diálogos), así que el mapa
  // siempre arranca centrado en el punto correcto. `useState` con
  // inicializador perezoso (no `useRef`): un ref no debe leerse durante el
  // render, un estado sí.
  const [initialCenter] = useState<[number, number]>([latitude, longitude]);

  return (
    <div className="overflow-hidden border" style={{ height: 260, borderColor: 'var(--border-input)' }}>
      <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={markerIcon} />
        <ClickHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}
