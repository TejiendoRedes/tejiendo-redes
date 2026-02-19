'use client';

import React from 'react';
import { PacienteForm } from '@/components/forms/PacienteForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { updatePaciente } from '@/actions/pacientes-actions';
import { toast } from 'sonner';

interface Step2PatientInfoProps {
    patient: any;
    comunidades: any[];
    onBack: () => void;
    onNext: (updatedPatient: any) => void;
}

export function Step2PatientInfo({ patient, comunidades, onBack, onNext }: Step2PatientInfoProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        // If data has changed, update it. For now, we assume user might have changed things.
        const res = await updatePaciente(patient.cedulaPaciente, data);
        if (res.success) {
            toast.success('Información del paciente actualizada');
            onNext({ ...patient, ...data });
        } else {
            // Even if update fails (e.g. no changes), we might want to allow proceeding
            // but let's be strict for now or check if it's just "no changes"
            if (res.error?.includes('no change')) {
                onNext({ ...patient, ...data });
            } else {
                toast.error(res.error || 'Error al actualizar información');
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Información del Paciente</h2>
                    <p className="text-sm text-gray-500">Verifique y actualice los datos personales si es necesario.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <PacienteForm
                    initialData={patient}
                    comunidades={comunidades}
                    onSubmit={handleSubmit}
                    onCancel={onBack}
                    isLoading={isLoading}
                    submitLabel="Siguiente: Antecedentes"
                />
            </div>
        </div>
    );
}
