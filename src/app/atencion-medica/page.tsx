import { getPacientes } from '@/queries/pacientes-actions';;
import { getMedicos } from '@/queries/medicos-actions';;
import { getAbordajes } from '@/queries/abordajes-actions';;
import { getEnfermedades } from '@/queries/enfermedades-actions';;
import { getComunidades } from '@/queries/comunidades-actions';;
import UnifiedMedicalAttention from './UnifiedMedicalAttention';

export const metadata = {
    title: 'Registro de Consulta | Tejiendo Redes',
    description: 'Flujo paso a paso para la atención médica de pacientes.',
};

export default async function AtencionMedicaPage() {
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
            comunidades={comunidadesRes.data || []}
            medicos={medicosRes.data || []}
            abordajes={abordajesRes.data || []}
            enfermedades={enfermedadesRes.data || []}
        />
    );
}
