import { getConsultas } from '@/queries/consultas';;
import { getPacientes } from '@/queries/pacientes';;
import { getMedicos } from '@/queries/medicos';;
import { getAbordajes } from '@/queries/abordajes';;
import { getEnfermedades } from '@/queries/enfermedades';;
import ConsultasClient from '@/components/features/consultas/consultas-client';

export default async function ConsultasPage() {
    // Parallel data fetching for efficiency
    const [
        consultasRes,
        pacientesRes,
        medicosRes,
        abordajesRes,
        enfermedadesRes
    ] = await Promise.all([
        getConsultas(),
        getPacientes(),
        getMedicos(),
        getAbordajes(),
        getEnfermedades()
    ]);

    if (!consultasRes.success) return <div>Error loading Consultas</div>;

    return (
        <ConsultasClient
            consultas={consultasRes.data || []}
            pacientes={pacientesRes.data || []}
            medicos={medicosRes.data || []}
            abordajes={abordajesRes.data || []}
            enfermedades={enfermedadesRes.data || []}
        />
    );
}
