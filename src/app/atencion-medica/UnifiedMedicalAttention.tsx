'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, User, ClipboardList, Stethoscope, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

// Actions
import { getPacientes } from '@/actions/pacientes-actions';
import { createConsulta } from '@/actions/consultas-actions';

// Sub-components (to be implemented next)
import { Step1PatientSelection } from './steps/Step1PatientSelection';
import { Step2PatientInfo } from './steps/Step2PatientInfo';
import { Step3MedicalHistory } from './steps/Step3MedicalHistory';
import { Step4Consultation } from './steps/Step4Consultation';

interface UnifiedMedicalAttentionProps {
    comunidades: any[];
    medicos: any[];
    abordajes: any[];
    enfermedades: any[];
}

export default function UnifiedMedicalAttention({
    comunidades,
    medicos,
    abordajes,
    enfermedades
}: UnifiedMedicalAttentionProps) {
    const [activeStep, setActiveStep] = React.useState('step1');
    const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
    const [patientInfo, setPatientInfo] = React.useState<any>(null);
    const [medicalHistory, setMedicalHistory] = React.useState<any>(null);
    const [fechaConsulta, setFechaConsulta] = React.useState<string>(new Date().toISOString().split('T')[0]);
    const [consultationData, setConsultationData] = React.useState<any>({
        motivoConsulta: '',
        diagnosticoTexto: '',
        tratamiento: '',
        recomendaciones: '',
        codigoAbordaje: '',
        cedulaMedico: '',
        selectedEnfermedades: []
    });

    const steps = [
        { id: 'step1', title: 'Paciente', icon: User },
        { id: 'step2', title: 'Información', icon: User },
        { id: 'step3', title: 'Antecedentes', icon: ClipboardList },
        { id: 'step4', title: 'Consulta', icon: Stethoscope },
    ];

    const handlePatientSelected = (patient: any) => {
        setSelectedPatient(patient);
        setPatientInfo(patient);
        // Reset steps after selection if needed
        setActiveStep('step2');
    };

    const handleSaveInfo = (info: any, consultaDate?: string) => {
        setPatientInfo(info);
        if (consultaDate) setFechaConsulta(consultaDate);
        setActiveStep('step3');
    };

    const handleSaveHistory = (history: any) => {
        setMedicalHistory(history);
        setActiveStep('step4');
    };

    const handleFinish = async (finalConsultation: any) => {
        if (!selectedPatient) return;

        // Save consultation data for persistence when navigating back
        setConsultationData(finalConsultation);

        const res = await createConsulta(
            {
                ...finalConsultation,
                cedulaPaciente: selectedPatient.cedulaPaciente,
                fechaConsulta: new Date(fechaConsulta),
            },
            finalConsultation.selectedEnfermedades || []
        );

        if (res.success) {
            toast.success(res.message);
            window.location.href = '/atencion-medica';
        } else {
            toast.error(res.error || 'Error al guardar la consulta');
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Consulta</h1>
                    <p className="text-gray-600">
                        Proceso integral de registro, actualización y consulta médica.
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="pb-0 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex justify-between items-center px-6 py-4 max-w-4xl mx-auto">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = activeStep === step.id;
                                const isCompleted = steps.findIndex(s => s.id === activeStep) > index;

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className="flex flex-col items-center gap-2 group transition-all">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' :
                                                isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                                                }`}>
                                                <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-widest font-black transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="flex-1 h-[2px] mx-4 bg-gray-100 rounded-full relative overflow-hidden hidden sm:block">
                                                <div className={`absolute top-0 left-0 h-full bg-blue-600/50 transition-all duration-700 ease-in-out ${isCompleted ? 'w-full' : 'w-0'
                                                    }`} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs value={activeStep} className="w-full">
                            <TabsContent value="step1" className="mt-0">
                                <Step1PatientSelection onSelect={handlePatientSelected} />
                            </TabsContent>

                            <TabsContent value="step2" className="mt-0">
                                <Step2PatientInfo
                                    patient={patientInfo}
                                    comunidades={comunidades}
                                    fechaConsulta={fechaConsulta}
                                    onBack={() => setActiveStep('step1')}
                                    onNext={handleSaveInfo}
                                />
                            </TabsContent>

                            <TabsContent value="step3" className="mt-0">
                                <Step3MedicalHistory
                                    patient={selectedPatient}
                                    onBack={() => setActiveStep('step2')}
                                    onNext={handleSaveHistory}
                                />
                            </TabsContent>

                            <TabsContent value="step4" className="mt-0">
                                <Step4Consultation
                                    patient={selectedPatient}
                                    medicos={medicos}
                                    abordajes={abordajes}
                                    enfermedades={enfermedades}
                                    initialData={consultationData}
                                    onBack={() => setActiveStep('step3')}
                                    onFinish={handleFinish}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
