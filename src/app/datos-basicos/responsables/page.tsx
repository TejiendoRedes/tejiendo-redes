import { getResponsables } from '@/queries/responsables';;
import ResponsablesClient from '@/components/features/responsables/responsables-client';

export default async function ResponsablesPage() {
    const { data: responsables, success } = await getResponsables();

    if (!success || !responsables) {
        return <div>Error al cargar los responsables</div>;
    }

    return <ResponsablesClient initialData={responsables} />;
}
