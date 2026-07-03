import { getPeticiones } from '@/queries/peticiones';
import PeticionesClient from '@/components/features/peticiones/peticiones-client';
import { getSession } from '@/lib/auth';

export default async function PeticionesPage() {
    const session = await getSession();
    const canEdit = session ? ['admin', 'superuser', 'operador', 'medico'].includes(session.role) : false;

    // Obtener datos iniciales
    const peticionesResult = await getPeticiones();

    return (
        <PeticionesClient 
            initialData={peticionesResult.success ? peticionesResult.data || [] : []}
            canEdit={canEdit}
        />
    );
}
