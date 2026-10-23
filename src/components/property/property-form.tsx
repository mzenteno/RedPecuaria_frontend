'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreatePropertyData, GeoPoint, Property } from '@/domain/property/property.entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';
import { formatHectares } from '@/lib/polygon-area';

const MAP_HEIGHT = 620;

// `leaflet` toca `window` al cargar el módulo (no solo al renderizar) — sin
// `ssr: false` rompe el bundle de servidor de Next, aunque este formulario
// nunca se renderice realmente en el servidor (mismo problema clásico de
// Leaflet + Next.js, documentado en su propio repo).
const PropertyMapEditor = dynamic(() => import('./property-map-editor').then((mod) => mod.PropertyMapEditor), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center border"
      style={{ height: MAP_HEIGHT + 48, borderColor: 'var(--border-input)' }}
    >
      <span className="tipo-muted">Cargando mapa...</span>
    </div>
  ),
});

// Santa Cruz, Bolivia — centro por defecto para una propiedad nueva, sin
// ubicación todavía elegida.
const DEFAULT_LATITUDE = -17.7833;
const DEFAULT_LONGITUDE = -63.1821;

const propertySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  /** `null` = alta. En edición llega ya cargado (`usePropertyById`) — el
   * formulario se monta recién cuando hay datos, así los `useState` arrancan
   * con los valores reales. */
  property: Property | null;
  onSave: (data: CreatePropertyData) => Promise<void>;
  /** Se llama tanto al cancelar como después de guardar bien (volver al
   * listado). */
  onDone: () => void;
}

/**
 * Alta/edición de una propiedad como pantalla propia (`/properties/new`,
 * `/properties/[id]`), no un diálogo (a pedido del usuario, 2026-10-23): el
 * mapa necesita espacio para dibujar el contorno.
 */
export function PropertyForm({ property, onSave, onDone }: PropertyFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(property?.latitude ?? DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(property?.longitude ?? DEFAULT_LONGITUDE);
  const [boundary, setBoundary] = useState<GeoPoint[]>(property?.boundary ?? []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: { name: property?.name ?? '' },
  });

  async function submit(data: PropertyFormData): Promise<void> {
    // 1 o 2 puntos no encierran ninguna superficie — mejor avisar que
    // descartarlos en silencio. Vacío sí es válido: el contorno es opcional.
    if (boundary.length > 0 && boundary.length < 3) {
      setError('El contorno necesita al menos 3 puntos (o bórralo si no quieres marcarlo)');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...data,
        latitude,
        longitude,
        boundary: boundary.length >= 3 ? boundary : null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar la propiedad');
      setSaving(false);
    }
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="card flex flex-col gap-6 p-6">
      <div className="max-w-md">
        <Input
          label="Nombre de la propiedad"
          placeholder="Ej. Azucaro"
          autoFocus
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="tipo-label">
          Mapa — en &quot;Ubicación&quot; un clic marca el punto. En &quot;Contorno&quot; cada clic agrega una esquina
          (sin límite); el cuadradito en medio de cada lado inserta una ahí; clic derecho borra una esquina; arrástralas
          para ajustar.
        </label>
        <PropertyMapEditor
          latitude={latitude}
          longitude={longitude}
          onLocationChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
          boundary={boundary}
          onBoundaryChange={setBoundary}
          height={MAP_HEIGHT}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="tipo-muted text-sm">
            Lat: {latitude.toFixed(6)} · Lng: {longitude.toFixed(6)}
            {' · '}
            {boundary.length >= 3
              ? `Superficie: ${formatHectares(boundary)} (${boundary.length} puntos)`
              : boundary.length > 0
                ? `Contorno: ${boundary.length} de 3 puntos mínimos`
                : 'Sin contorno'}
          </span>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="tipo-link text-sm">
            Ver en Google Maps →
          </a>
        </div>
      </div>

      {error && <p className="tipo-error">{error}</p>}

      <div className="dialog-footer">
        <Button type="button" variant="secondary" onClick={onDone} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
