import { getResponsables } from '@/queries/responsables';
import ResponsablesClient from '@/components/features/responsables/responsables-client';
import { getSession } from '@/lib/auth';

export default async function ResponsablesPage() {
    const session = await getSession();
    const canManage = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;

    const res = await getResponsables();

    if (!res.success) {
        return <div>Error al cargar los responsables.</div>;
    }

    return <ResponsablesClient initialData={res.data || []} canManage={canManage} />;
}
