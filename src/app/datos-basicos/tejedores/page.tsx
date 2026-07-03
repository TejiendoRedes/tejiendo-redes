import { ErrorState } from '@/components/ui/ErrorState';
import { getTejedores } from '@/queries/tejedores';
import TejedoresClient from '@/components/features/tejedores/tejedores-client';
import { getSession } from '@/lib/auth';

export default async function TejedoresPage() {
    const session = await getSession();
    const isAdmin = session?.role === 'admin' || session?.role === 'superuser';

    const { data: tejedores, success } = await getTejedores();

    if (!success || !tejedores) {
        return <ErrorState title="Error de Carga" message="Error al cargar los tejedores" />;
    }

    return <TejedoresClient initialData={tejedores} isAdmin={isAdmin} />;
}
