import { getPeticiones } from '@/queries/peticiones';;
import PeticionesClient from '@/components/features/peticiones/peticiones-client';

export default async function PeticionesPage() {
    // Obtener datos iniciales
    const peticionesResult = await getPeticiones();

    return (
        <PeticionesClient 
            initialData={peticionesResult.success ? peticionesResult.data || [] : []}
        />
    );
}
