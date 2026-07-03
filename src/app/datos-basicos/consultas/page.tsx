import { ErrorState } from '@/components/ui/ErrorState';
import { getConsultas } from '@/queries/consultas';
import { getPacientes } from '@/queries/pacientes';
import { getMedicos } from '@/queries/medicos';
import { getAbordajes } from '@/queries/abordajes';
import { getEnfermedades } from '@/queries/enfermedades';
import ConsultasClient from '@/components/features/consultas/consultas-client';
import { getSession } from '@/lib/auth';

export default async function ConsultasPage() {
    const session = await getSession();
    const isAdmin = session ? ['admin', 'superuser'].includes(session.role) : false;

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

    if (!consultasRes.success) return <ErrorState title="Error de Carga" message="Error loading Consultas" />;

    return (
        <ConsultasClient
            consultas={consultasRes.data || []}
            pacientes={pacientesRes.data || []}
            medicos={medicosRes.data || []}
            abordajes={abordajesRes.data || []}
            enfermedades={enfermedadesRes.data || []}
            isAdmin={isAdmin}
        />
    );
}
