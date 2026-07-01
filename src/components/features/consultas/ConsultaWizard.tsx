'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Activity, FileText, Pill, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { AntecedentesStep } from './steps/AntecedentesStep';
import { TriajeStep } from './steps/TriajeStep';
import { DiagnosticoStep } from './steps/DiagnosticoStep';
import { TratamientoStep } from './steps/TratamientoStep';

export type WizardData = {
    // Antecedentes (Paso 1)
    enfermedadesPrevias: string;
    alergias: string;
    enfermedadesFamilia: string;
    cirugiasPrevias: string;
    medicamentosActuales: string;
    // Triaje (Paso 2)
    peso: string;
    talla: string;
    temperatura: string;
    FC: string;
    TA: string;
    // Diagnostico (Paso 3)
    motivoConsulta: string;
    diagnosticoTexto: string;
    enfermedadesIds: string[];
    // Tratamiento (Paso 4)
    recomendaciones: string;
    tratamiento: string;
};

const INITIAL_DATA: WizardData = {
    enfermedadesPrevias: '',
    alergias: '',
    enfermedadesFamilia: '',
    cirugiasPrevias: '',
    medicamentosActuales: '',
    peso: '',
    talla: '',
    temperatura: '',
    FC: '',
    TA: '',
    motivoConsulta: '',
    diagnosticoTexto: '',
    enfermedadesIds: [],
    recomendaciones: '',
    tratamiento: '',
};

interface ConsultaWizardProps {
    paciente: any;
    medico: any;
    abordaje: any;
    enfermedadesDisponibles: any[];
    initialData?: Partial<WizardData>;
    onSave: (data: WizardData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const STEPS = [
    { id: 1, title: 'Antecedentes', icon: FileText },
    { id: 2, title: 'Triaje', icon: Activity },
    { id: 3, title: 'Diagnóstico', icon: User }, // Or Stethoscope
    { id: 4, title: 'Tratamiento', icon: Pill },
];

export function ConsultaWizard({ paciente, medico, abordaje, enfermedadesDisponibles, initialData, onSave, onCancel, isLoading }: ConsultaWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<WizardData>({ ...INITIAL_DATA, ...initialData });

    const updateFormData = (fields: Partial<WizardData>) => {
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const calcularEdad = (fecha: string | Date | null) => {
        if (!fecha) return '-';
        const hoy = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 fade-in">
            {/* Header: Patient Info */}
            <Card className="p-6 flex items-center justify-between border-blue-100 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                        {paciente?.nombrePaciente?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{paciente?.nombrePaciente} {paciente?.apellidoPaciente}</h2>
                        <p className="text-sm text-gray-500">
                            CI V-{paciente?.cedulaPaciente} • {calcularEdad(paciente?.fechaNacimiento)} años • {paciente?.sexo === 'F' ? 'Femenino' : paciente?.sexo === 'M' ? 'Masculino' : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {abordaje && (
                        <div className="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700">
                            Abordaje: {abordaje.codigoAbordaje}
                        </div>
                    )}
                    <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                        Dr. {medico?.tejedor?.nombre1 || ''} {medico?.tejedor?.apellido1 || ''}
                    </div>
                </div>
            </Card>

            {/* Stepper */}
            <div className="flex items-center justify-between px-2 md:px-10">
                {STEPS.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${isActive ? 'bg-[#1e3a8a] text-white shadow-md' : isCompleted ? 'bg-blue-100 text-[#1e3a8a]' : 'bg-gray-100 text-gray-400'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paso {step.id}</p>
                                    <p className={`text-sm font-semibold ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                </div>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`flex-1 h-[2px] mx-4 transition-colors ${isCompleted ? 'bg-[#1e3a8a]' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 1 && <AntecedentesStep data={formData} updateData={updateFormData} />}
                {currentStep === 2 && <TriajeStep data={formData} updateData={updateFormData} />}
                {currentStep === 3 && <DiagnosticoStep data={formData} updateData={updateFormData} enfermedadesDisponibles={enfermedadesDisponibles} />}
                {currentStep === 4 && <TratamientoStep data={formData} updateData={updateFormData} />}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <Button variant="ghost" onClick={onCancel} className="text-gray-500">
                    Cancelar
                </Button>
                <div className="flex items-center gap-3">
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>
                    )}
                    
                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext} className="bg-[#1e3a8a] hover:bg-blue-900 text-white">
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Guardando...' : 'Guardar Consulta'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
