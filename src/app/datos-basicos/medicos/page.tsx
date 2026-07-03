import { ErrorState } from '@/components/ui/ErrorState';
import { getMedicos } from '@/queries/medicos';
import { getTejedores } from '@/queries/tejedores';
import { getEspecialidades } from '@/queries/especialidades';
import MedicosClient from '@/components/features/medicos/medicos-client';
import { getSession } from '@/lib/auth';

export default async function MedicosPage() {
    const session = await getSession();
    const isAdmin = session ? ['admin', 'superuser'].includes(session.role) : false;

    const [medicosRes, tejedoresRes, especialidadesRes] = await Promise.all([
        getMedicos(),
        getTejedores(),
        getEspecialidades(),
    ]);

    if (!medicosRes.success || !tejedoresRes.success || !especialidadesRes.success) {
        return <ErrorState title="Error de Carga" message="Error al cargar los datos." />;
    }

    return (
        <MedicosClient
            initialMedicos={medicosRes.data || []}
            tejedores={tejedoresRes.data || []}
            especialidades={especialidadesRes.data || []}
            isAdmin={isAdmin}
        />
    );
}
