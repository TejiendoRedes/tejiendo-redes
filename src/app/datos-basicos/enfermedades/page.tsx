import { getEnfermedades } from '@/queries/enfermedades';
import EnfermedadesClient from '@/components/features/enfermedades/enfermedades-client';
import { getSession } from '@/lib/auth';

export default async function EnfermedadesPage() {
    const session = await getSession();
    const canEdit = session ? ['admin', 'superuser', 'medico'].includes(session.role) : false;

    const res = await getEnfermedades();

    if (!res.success) {
        return <div>Error al cargar las enfermedades.</div>;
    }

    return (
        <EnfermedadesClient
            initialData={res.data || []}
            canEdit={canEdit}
        />
    );
}
