'use client';

import React from 'react';
import { getPacientes } from '@/queries/pacientes';;
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { UserPlus, Search, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { PacienteForm } from '@/components/forms/PacienteForm';
import { createPaciente } from '@/actions/pacientes-actions';
import { toast } from 'sonner';

interface Step1PatientSelectionProps {
    onSelect: (patient: any) => void;
}

export function Step1PatientSelection({ onSelect }: Step1PatientSelectionProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [pacientes, setPacientes] = React.useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [creandoPaciente, setCreandoPaciente] = React.useState(false);
    const [comunidades, setComunidades] = React.useState<any[]>([]);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await getPacientes();
        if (res.success) {
            setPacientes(res.data || []);
        }

        // Need comunidades for the form
        const { getComunidades } = await import('@/queries/comunidades');
        const comRes = await getComunidades();
        if (comRes.success) {
            setComunidades(comRes.data || []);
        }
        setIsLoading(false);
    };

    const handleCreatePaciente = async (data: any) => {
        setCreandoPaciente(true);
        const res = await createPaciente(data);
        if (res.success) {
            toast.success('Paciente creado exitosamente');
            setIsModalOpen(false);
            // Auto-select the newly created patient
            onSelect(data);
        } else {
            toast.error(res.error || 'Error al crear paciente');
        }
        setCreandoPaciente(false);
    };

    const columns = [
        {
            key: 'cedulaPaciente',
            label: 'Cédula',
        },
        {
            key: 'nombrePaciente',
            label: 'Nombre completo',
            render: (p: any) => `${p.nombrePaciente} ${p.apellidoPaciente}`,
        },
        {
            key: 'comunidad',
            label: 'Comunidad',
            render: (p: any) => p.comunidad?.nombreComunidad || '-',
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (p: any) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                    onClick={() => onSelect(p)}
                >
                    <Check className="w-4 h-4" />
                    Seleccionar
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Seleccionar Paciente</h2>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Nuevo Paciente
                </Button>
            </div>

            <DataTable
                data={pacientes}
                columns={columns}
                searchPlaceholder="Buscar por cédula or nombre..."
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
                        <DialogDescription>
                            Complete los datos para registrar un paciente y continuar con la consulta.
                        </DialogDescription>
                    </DialogHeader>

                    <PacienteForm
                        comunidades={comunidades}
                        onSubmit={handleCreatePaciente}
                        onCancel={() => setIsModalOpen(false)}
                        isLoading={creandoPaciente}
                        submitLabel="Crear y Seleccionar"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
