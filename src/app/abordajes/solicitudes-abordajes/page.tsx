import { getSolicitudesAbordajes } from '@/queries/solicitudes-abordajes';;
import { getComunidadesParaSolicitud } from '@/queries/solicitudes-abordajes';;
import SolicitudesAbordajesClient from '@/components/features/solicitudes-abordajes/solicitudes-abordajes-client';

export default async function SolicitudesAbordajesPage() {
    // Obtener datos iniciales
    const solicitudesResult = await getSolicitudesAbordajes();
    const comunidadesResult = await getComunidadesParaSolicitud();

    return (
        <SolicitudesAbordajesClient
            initialData={solicitudesResult.success ? solicitudesResult.data || [] : []}
            comunidades={comunidadesResult.success ? comunidadesResult.data || [] : []}
        />
    );
}
