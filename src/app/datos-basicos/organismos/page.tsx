import { ErrorState } from '@/components/ui/ErrorState';
import { getOrganismos } from '@/queries/organismos';
import { getTejedores } from '@/queries/tejedores';
import OrganismosClient from '@/components/features/organismos/organismos-client';
import { getSession } from '@/lib/auth';

export default async function OrganismosPage() {
    const session = await getSession();
    const canManage = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;

    const [organismosRes, tejedoresRes] = await Promise.all([
        getOrganismos(),
        getTejedores(),
    ]);

    if (!organismosRes.success || !tejedoresRes.success) {
        return <ErrorState title="Error de Carga" message="Error al cargar los datos." />;
    }

    return (
        <OrganismosClient
            initialData={organismosRes.data || []}
            tejedores={tejedoresRes.data || []}
            canManage={canManage}
        />
    );
}
