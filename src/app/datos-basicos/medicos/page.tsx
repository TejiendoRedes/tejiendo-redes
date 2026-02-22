import { getMedicos } from '@/queries/medicos-actions';;
import { getTejedores } from '@/queries/tejedores-actions';;
import { getEspecialidades } from '@/queries/especialidades-actions';;
import MedicosClient from '@/components/features/medicos/medicos-client';

export default async function MedicosPage() {
    const [medicosRes, tejedoresRes, especialidadesRes] = await Promise.all([
        getMedicos(),
        getTejedores(),
        getEspecialidades(),
    ]);

    if (!medicosRes.success || !tejedoresRes.success || !especialidadesRes.success) {
        return <div>Error al cargar los datos.</div>;
    }

    return (
        <MedicosClient
            initialMedicos={medicosRes.data || []}
            tejedores={tejedoresRes.data || []}
            especialidades={especialidadesRes.data || []}
        />
    );
}
