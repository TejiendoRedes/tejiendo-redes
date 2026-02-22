import { getEnfermedades } from '@/queries/enfermedades-actions';;
import EnfermedadesClient from '@/components/features/enfermedades/enfermedades-client';

export default async function EnfermedadesPage() {
    const res = await getEnfermedades();

    if (!res.success) {
        return <div>Error al cargar las enfermedades.</div>;
    }

    return (
        <EnfermedadesClient
            initialData={res.data || []}
        />
    );
}
