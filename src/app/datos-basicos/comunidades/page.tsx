import { ErrorState } from '@/components/ui/ErrorState';
import { getComunidades } from '@/queries/comunidades';
import { getResponsables } from '@/queries/responsables';
import ComunidadesClient from '@/components/features/comunidades/comunidades-client';
import { getSession } from '@/lib/auth';

export default async function ComunidadesPage() {
    const session = await getSession();
    const canManage = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;

    const [comunidadesRes, responsablesRes] = await Promise.all([
        getComunidades(),
        getResponsables(),
    ]);

    if (!comunidadesRes.success || !responsablesRes.success) {
        return <ErrorState title="Error de Carga" message="Error al cargar los datos." />;
    }

    return (
        <ComunidadesClient
            initialData={comunidadesRes.data || []}
            responsables={responsablesRes.data || []}
            canManage={canManage}
        />
    );
}
