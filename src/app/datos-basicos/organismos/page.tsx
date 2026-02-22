import { getOrganismos } from '@/queries/organismos-actions';;
import { getTejedores } from '@/queries/tejedores-actions';;
import OrganismosClient from '@/components/features/organismos/organismos-client';

export default async function OrganismosPage() {
    const [organismosRes, tejedoresRes] = await Promise.all([
        getOrganismos(),
        getTejedores(),
    ]);

    if (!organismosRes.success || !tejedoresRes.success) {
        return <div>Error al cargar los datos.</div>;
    }

    return (
        <OrganismosClient
            initialData={organismosRes.data || []}
            tejedores={tejedoresRes.data || []}
        />
    );
}
