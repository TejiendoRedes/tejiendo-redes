import { getPacientes } from '@/queries/pacientes';
import { getMedicos } from '@/queries/medicos';
import { getAbordajes } from '@/queries/abordajes';
import { getEnfermedades } from '@/queries/enfermedades';
import { getComunidades } from '@/queries/comunidades';
import UnifiedMedicalAttention from './UnifiedMedicalAttention';
import { getSession } from '@/lib/auth';

export const metadata = {
    title: 'Registro de Consulta | Tejiendo Redes',
    description: 'Flujo paso a paso para la atención médica de pacientes.',
};

export default async function AtencionMedicaPage() {
    const session = await getSession();
    const canCreate = session ? ['admin', 'superuser', 'medico'].includes(session.role) : false;

    // Fetch necessary data for the flow
    const [
        pacientesRes,
        medicosRes,
        abordajesRes,
        enfermedadesRes,
        comunidadesRes
    ] = await Promise.all([
        getPacientes(),
        getMedicos(),
        getAbordajes(),
        getEnfermedades(),
        getComunidades(),
    ]);

    return (
        <UnifiedMedicalAttention
            pacientes={pacientesRes.data || []}
            comunidades={comunidadesRes.data || []}
            medicos={medicosRes.data || []}
            abordajes={abordajesRes.data || []}
            enfermedades={enfermedadesRes.data || []}
            canCreate={canCreate}
        />
    );
}
