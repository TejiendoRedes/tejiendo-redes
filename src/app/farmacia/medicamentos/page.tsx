import { getMedicamentos } from '@/actions/medicamentos-actions';
import MedicamentosClient from './medicamentos-client';

export default async function MedicamentosPage() {
    const { data: medicamentos, success } = await getMedicamentos();

    if (!success || !medicamentos) {
        return <div>Error al cargar los medicamentos</div>;
    }

    return <MedicamentosClient initialData={medicamentos} />;
}
