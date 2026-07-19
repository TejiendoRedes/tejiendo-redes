import { getEntregas } from '@/queries/entregas';
import EntregasClient from '@/components/features/entregas/entregas-client';
import { getSession } from '@/lib/auth';

export default async function EntregasPage() {
    const session = await getSession();
    const canEdit = session ? ['admin', 'superuser', 'operador', 'medico'].includes(session.role) : false;

    // Obtener datos iniciales
    const entregasResult = await getEntregas();

    return (
        <EntregasClient 
            initialData={entregasResult.success ? entregasResult.data || [] : []}
            canEdit={canEdit}
        />
    );
}
