import { getSolicitudesAbordajes } from '@/actions/solicitudes-abordajes-actions';
import { getComunidadesParaSolicitud } from '@/actions/solicitudes-abordajes-actions';
import SolicitudesAbordajesClient from './solicitudes-abordajes-client';

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
