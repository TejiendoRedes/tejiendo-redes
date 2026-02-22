import { getAntecedentes } from '@/queries/antecedentes';;
import { getPacientes } from '@/queries/pacientes';;
import AntecedentesClient from '@/components/features/antecedentes/antecedentes-client';

export default async function AntecedentesPage() {
    const [antecedentesRes, pacientesRes] = await Promise.all([
        getAntecedentes(),
        getPacientes(),
    ]);

    if (!antecedentesRes.success || !pacientesRes.success) {
        return <div>Error al cargar los datos.</div>;
    }

    // Extract patients from the response, handling the joined structure if necessary, 
    // but getPacientes returns the joined structure. 
    // The client component for Antecedentes needs a simple list of patients for the select.
    // pacientesRes.data is PacienteWithComunidad[].

    return (
        <AntecedentesClient
            initialData={antecedentesRes.data || []}
            pacientes={pacientesRes.data || []}
        />
    );
}
