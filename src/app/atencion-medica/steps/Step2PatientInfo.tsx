'use client';

import React from 'react';
import { PacienteForm } from '@/components/forms/PacienteForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import { updatePaciente } from '@/actions/pacientes-actions';
import { toast } from 'sonner';

interface Step2PatientInfoProps {
    patient: any;
    comunidades: any[];
    fechaConsulta?: string;
    onBack: () => void;
    onNext: (updatedPatient: any, fechaConsulta?: string) => void;
}

export function Step2PatientInfo({ patient, comunidades, fechaConsulta: initialFechaConsulta, onBack, onNext }: Step2PatientInfoProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [fechaConsulta, setFechaConsulta] = React.useState(initialFechaConsulta || new Date().toISOString().split('T')[0]);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        // If data has changed, update it. For now, we assume user might have changed things.
        const res = await updatePaciente(patient.cedulaPaciente, data);
        if (res.success) {
            toast.success('Información del paciente actualizada');
            onNext({ ...patient, ...data }, fechaConsulta);
        } else {
            // Even if update fails (e.g. no changes), we might want to allow proceeding
            // but let's be strict for now or check if it's just "no changes"
            if (res.error?.includes('no change')) {
                onNext({ ...patient, ...data }, fechaConsulta);
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
                <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="fechaConsulta" className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                Fecha de Consulta <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input
                                id="fechaConsulta"
                                type="date"
                                value={fechaConsulta}
                                onChange={(e) => setFechaConsulta(e.target.value)}
                                required
                                className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        <p className="text-[11px] text-blue-500 font-medium italic pb-2">
                            Fecha en la que se realiza esta consulta médica.
                        </p>
                    </div>
                </div>
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
