'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyById } from '@/hooks/property/use-property-by-id';
import { usePropertyMutations } from '@/hooks/property/use-property-mutations';
import { PropertyForm } from '@/components/property/property-form';
import { PROPERTIES_PATH, PropertyFormScreen } from '@/components/property/property-form-screen';
import { ApiError } from '@/infrastructure/http/http-client';

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, error } = usePropertyById(id);
  const { updateProperty } = usePropertyMutations();

  return (
    <PropertyFormScreen
      title={property ? `Editar propiedad — ${property.name}` : 'Editar propiedad'}
      subtitle="Modifica los datos, la ubicación o el contorno de la propiedad."
      requires="edit"
    >
      {isLoading && <p className="tipo-muted">Cargando propiedad...</p>}
      {error && (
        <p className="tipo-error">{error instanceof ApiError ? error.message : 'No se pudo cargar la propiedad'}</p>
      )}
      {/* Se monta recién con los datos ya cargados: `PropertyForm` toma sus
          valores iniciales una sola vez (`useState`). `key` por si se navega
          de una propiedad a otra sin desmontar la ruta. */}
      {property && (
        <PropertyForm
          key={property.id}
          property={property}
          onSave={async (data) => {
            await updateProperty(property.id, data);
          }}
          onDone={() => router.push(PROPERTIES_PATH)}
        />
      )}
    </PropertyFormScreen>
  );
}
