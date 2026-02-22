import { getMedicos } from '@/queries/medicos';;
import { getTejedores } from '@/queries/tejedores';;
import { getEspecialidades } from '@/queries/especialidades';;
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
