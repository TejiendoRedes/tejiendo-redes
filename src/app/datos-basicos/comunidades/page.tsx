import { getComunidades } from '@/queries/comunidades';;
import { getResponsables } from '@/queries/responsables';;
import ComunidadesClient from '@/components/features/comunidades/comunidades-client';

export default async function ComunidadesPage() {
    const [comunidadesRes, responsablesRes] = await Promise.all([
        getComunidades(),
        getResponsables(),
    ]);

    if (!comunidadesRes.success || !responsablesRes.success) {
        return <div>Error al cargar los datos.</div>;
    }

    return (
        <ComunidadesClient
            initialData={comunidadesRes.data || []}
            responsables={responsablesRes.data || []}
        />
    );
}
