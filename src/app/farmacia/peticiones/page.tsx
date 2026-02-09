import { getPeticiones } from '@/actions/peticiones-actions';
import PeticionesClient from './peticiones-client';

export default async function PeticionesPage() {
    // Obtener datos iniciales
    const peticionesResult = await getPeticiones();

    return (
        <PeticionesClient 
            initialData={peticionesResult.success ? peticionesResult.data || [] : []}
        />
    );
}
