import { ErrorState } from '@/components/ui/ErrorState';
import { getResponsables } from '@/queries/responsables';
import ResponsablesClient from '@/components/features/responsables/responsables-client';
import { getSession } from '@/lib/auth';

export default async function ResponsablesPage() {
    const session = await getSession();
    const canManage = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;

    const res = await getResponsables();

    if (!res.success) {
        return <ErrorState title="Error de Carga" message="Error al cargar los responsables." />;
    }

    return <ResponsablesClient initialData={res.data || []} canManage={canManage} />;
}
