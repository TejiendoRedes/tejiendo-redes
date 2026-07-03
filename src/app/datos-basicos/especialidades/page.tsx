import { getEspecialidades } from '@/queries/especialidades';
import EspecialidadesClient from '@/components/features/especialidades/especialidades-client';
import { getSession } from '@/lib/auth';

export default async function EspecialidadesPage() {
    const session = await getSession();
    const isAdmin = session ? ['admin', 'superuser'].includes(session.role) : false;

    const res = await getEspecialidades();

    if (!res.success) {
        return <div>Error al cargar las especialidades</div>;
    }

    return <EspecialidadesClient initialData={res.data || []} isAdmin={isAdmin} />;
}
