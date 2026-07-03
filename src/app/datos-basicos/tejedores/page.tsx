import { getTejedores } from '@/queries/tejedores';
import TejedoresClient from '@/components/features/tejedores/tejedores-client';
import { getSession } from '@/lib/auth';

export default async function TejedoresPage() {
    const session = await getSession();
    const isAdmin = session?.role === 'admin' || session?.role === 'superuser';

    const { data: tejedores, success } = await getTejedores();

    if (!success || !tejedores) {
        return <div>Error al cargar los tejedores</div>;
    }

    return <TejedoresClient initialData={tejedores} isAdmin={isAdmin} />;
}
