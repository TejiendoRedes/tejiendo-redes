import { getMedicamentos } from '@/queries/medicamentos';
import MedicamentosClient from '@/components/features/medicamentos/medicamentos-client';
import { getSession } from '@/lib/auth';

export default async function MedicamentosPage() {
    const session = await getSession();
    // Tejedores solo pueden ver. Admins, superusers y operadores pueden editar. Médicos pueden ver (y despachar en peticiones).
    const canEdit = session ? ['admin', 'superuser', 'operador'].includes(session.role) : false;

    const { data: medicamentos, success } = await getMedicamentos();

    if (!success || !medicamentos) {
        return <div>Error al cargar los medicamentos</div>;
    }

    return <MedicamentosClient initialData={medicamentos} canEdit={canEdit} />;
}
