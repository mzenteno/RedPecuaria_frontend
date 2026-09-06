'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Property } from '@/domain/property/property.entity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/infrastructure/http/http-client';

// `leaflet` toca `window` al cargar el módulo (no solo al renderizar) — sin
// `ssr: false` rompe el bundle de servidor de Next, aunque este diálogo
// nunca se renderice realmente en el servidor (mismo problema clásico de
// Leaflet + Next.js, documentado en su propio repo).
const LocationMapPicker = dynamic(
  () => import('./location-map-picker').then((mod) => mod.LocationMapPicker),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center border"
        style={{ height: 520, borderColor: 'var(--border-input)' }}
      >
        <span className="tipo-muted">Cargando mapa...</span>
      </div>
    ),
  },
);

// Santa Cruz, Bolivia — centro por defecto para una propiedad nueva, sin
// ubicación todavía elegida.
const DEFAULT_LATITUDE = -17.7833;
const DEFAULT_LONGITUDE = -63.1821;

const propertySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  property: Property | null;
  onClose: () => void;
  onSave: (data: PropertyFormData & { latitude: number; longitude: number }) => Promise<void>;
}

export function PropertyDialog({ open, mode, property, onClose, onSave }: PropertyDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(property?.latitude ?? DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(property?.longitude ?? DEFAULT_LONGITUDE);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: { name: mode === 'edit' ? (property?.name ?? '') : '' },
  });

  async function submit(data: PropertyFormData): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...data, latitude, longitude });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar la propiedad');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="dialog-overlay">
      <div className="dialog-panel dialog-panel-lg flex flex-col gap-8" style={{ maxWidth: '64rem' }}>
        <div className="flex flex-col gap-1">
          <h2 className="tipo-titulo-seccion">{mode === 'create' ? 'Nueva propiedad' : 'Editar propiedad'}</h2>
          <p className="tipo-secundario">
            {mode === 'create' ? 'Completa el nombre y la ubicación de la nueva propiedad.' : 'Modifica los datos de la propiedad.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate autoComplete="off" className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre de la propiedad"
              placeholder="Ej. Azucaro"
              autoFocus
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="flex flex-col gap-2">
              <label className="tipo-label">Ubicación (clic en el mapa para marcarla)</label>
              <LocationMapPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
              <div className="flex items-center justify-between">
                <span className="tipo-muted text-sm">
                  Lat: {latitude.toFixed(6)} · Lng: {longitude.toFixed(6)}
                </span>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="tipo-link text-sm">
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </div>

          {error && <p className="tipo-error">{error}</p>}

          <div className="dialog-footer">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
