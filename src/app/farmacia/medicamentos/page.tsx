import { getMedicamentos } from '@/queries/medicamentos-actions';;
import MedicamentosClient from '@/components/features/medicamentos/medicamentos-client';

export default async function MedicamentosPage() {
    const { data: medicamentos, success } = await getMedicamentos();

    if (!success || !medicamentos) {
        return <div>Error al cargar los medicamentos</div>;
    }

    return <MedicamentosClient initialData={medicamentos} />;
}
