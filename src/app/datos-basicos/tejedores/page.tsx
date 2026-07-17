import { ErrorState } from '@/components/ui/ErrorState';
import { getTejedores } from '@/queries/tejedores';
import TejedoresClient from '@/components/features/tejedores/tejedores-client';
import { getSession } from '@/lib/auth';

import { getEspecialidades } from '@/queries/especialidades';

export default async function TejedoresPage() {
    const session = await getSession();
    const isAdmin = session?.role === 'admin' || session?.role === 'superuser';

    const [tejedoresRes, especialidadesRes] = await Promise.all([
        getTejedores(),
        getEspecialidades()
    ]);

    if (!tejedoresRes.success || !tejedoresRes.data) {
        return <ErrorState title="Error de Carga" message="Error al cargar los tejedores" />;
    }

    const especialidades = especialidadesRes.success && especialidadesRes.data ? especialidadesRes.data : [];

    return <TejedoresClient initialData={tejedoresRes.data} especialidades={especialidades} isAdmin={isAdmin} />;
}
