'use client';

import { useRouter } from 'next/navigation';
import { usePropertyMutations } from '@/hooks/property/use-property-mutations';
import { PropertyForm } from '@/components/property/property-form';
import { PROPERTIES_PATH, PropertyFormScreen } from '@/components/property/property-form-screen';

export default function NewPropertyPage() {
  const router = useRouter();
  const { createProperty } = usePropertyMutations();

  return (
    <PropertyFormScreen
      title="Nueva propiedad"
      subtitle="Completa el nombre, la ubicación y, si quieres, el contorno de la nueva propiedad."
      requires="create"
    >
      <PropertyForm
        property={null}
        onSave={async (data) => {
          await createProperty(data);
        }}
        onDone={() => router.push(PROPERTIES_PATH)}
      />
    </PropertyFormScreen>
  );
}
