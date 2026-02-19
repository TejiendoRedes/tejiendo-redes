import { getPacientes } from '@/actions/pacientes-actions';
import { getMedicos } from '@/actions/medicos-actions';
import { getAbordajes } from '@/actions/abordajes-actions';
import { getEnfermedades } from '@/actions/enfermedades-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import UnifiedMedicalAttention from './UnifiedMedicalAttention';

export const metadata = {
    title: 'Atención Médica Unificada | Tejiendo Redes',
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
