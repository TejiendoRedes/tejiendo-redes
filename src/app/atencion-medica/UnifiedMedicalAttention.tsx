'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Stethoscope } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { toast } from 'sonner';

import { getAntecedentesByPaciente } from '@/queries/consultas';
import { saveConsultaWizard } from '@/actions/consultas-actions';
import { ConsultaWizard, type WizardData } from '@/components/features/consultas/ConsultaWizard';

interface UnifiedMedicalAttentionProps {
    pacientes: any[];
    comunidades: any[];
    medicos: any[];
    abordajes: any[];
    enfermedades: any[];
}

export default function UnifiedMedicalAttention({
    pacientes,
    comunidades,
    medicos,
    abordajes,
    enfermedades
}: UnifiedMedicalAttentionProps) {
    const router = useRouter();
    const [view, setView] = useState<'setup' | 'wizard'>('setup');
    const [isLoading, setIsLoading] = useState(false);

    // Setup State
    const [selectedSetup, setSelectedSetup] = useState({
        codigoAbordaje: '',
        cedulaPaciente: '',
        cedulaMedico: ''
    });

    const [wizardInitialData, setWizardInitialData] = useState<Partial<WizardData>>({});

    const handleSetupNext = async () => {
        if (!selectedSetup.codigoAbordaje || !selectedSetup.cedulaPaciente || !selectedSetup.cedulaMedico) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
        }

        setIsLoading(true);
        try {
            // Cargar antecedentes del paciente si existen
            const antRes = await getAntecedentesByPaciente(selectedSetup.cedulaPaciente);
            
            setWizardInitialData({
                enfermedadesPrevias: antRes.data?.enfermedadesPrevias || '',
                alergias: antRes.data?.alergias || '',
                enfermedadesFamilia: antRes.data?.enfermedadesFamilia || '',
                cirugiasPrevias: antRes.data?.cirugiasPrevias || '',
                medicamentosActuales: antRes.data?.medicamentosActuales || '',
                peso: antRes.data?.peso ? String(antRes.data.peso) : '',
                talla: antRes.data?.talla ? String(antRes.data.talla) : '',
                temperatura: antRes.data?.temperatura ? String(antRes.data.temperatura) : '',
                FC: antRes.data?.FC || '',
                TA: antRes.data?.TA || '',
                motivoConsulta: '',
                diagnosticoTexto: '',
                enfermedadesIds: [],
                recomendaciones: '',
                tratamiento: '',
            });

            setView('wizard');
        } catch (error) {
            toast.error('Error al cargar antecedentes del paciente');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWizardSave = async (data: WizardData) => {
        setIsLoading(true);
        try {
            const consultaData = {
                codigoAbordaje: selectedSetup.codigoAbordaje,
                cedulaPaciente: selectedSetup.cedulaPaciente,
                cedulaMedico: selectedSetup.cedulaMedico,
                motivoConsulta: data.motivoConsulta,
                diagnosticoTexto: data.diagnosticoTexto,
                recomendaciones: data.recomendaciones,
                tratamiento: data.tratamiento,
            };

            const antecedentesData = {
                peso: data.peso || '0',
                talla: data.talla || '0',
                temperatura: data.temperatura || '0',
                FC: data.FC || '',
                TA: data.TA || '',
                enfermedadesPrevias: data.enfermedadesPrevias || '',
                alergias: data.alergias || '',
                enfermedadesFamilia: data.enfermedadesFamilia || '',
                cirugiasPrevias: data.cirugiasPrevias || '',
                medicamentosActuales: data.medicamentosActuales || '',
            };

            const res = await saveConsultaWizard(
                consultaData,
                data.enfermedadesIds,
                antecedentesData
            );

            if (res.success) {
                toast.success('Consulta guardada exitosamente');
                // Al guardar exitosamente, volvemos al setup para atender a otro paciente
                setView('setup');
                setSelectedSetup({ ...selectedSetup, cedulaPaciente: '' });
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Ocurrió un error al guardar la consulta');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWizardCancel = () => {
        setView('setup');
    };

    const selectedPacienteRecord = pacientes?.find(p => p.cedulaPaciente === selectedSetup.cedulaPaciente);
    const selectedMedicoRecord = medicos?.find(m => m.cedulaTejedor === selectedSetup.cedulaMedico);
    const selectedAbordajeRecord = abordajes?.find(a => {
        const abordajeData = a.abordaje || a;
        return abordajeData.codigoAbordaje === selectedSetup.codigoAbordaje;
    });

    return (
        <MainLayout>
            <PageShell 
                title="Atención Médica" 
                subtitle={view === 'setup' ? "Consulta clínica · Seleccionar abordaje" : "Consulta clínica · Registro paso a paso"}
            >
                {view === 'setup' ? (
                    <div className="space-y-6 max-w-2xl mx-auto pt-8">
                        <Card className="p-8 border-none shadow-2xl bg-white rounded-3xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                                <Activity className="w-8 h-8 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Configuración Inicial</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="1. Seleccione el Abordaje"
                                        items={abordajes.map((ab: any) => {
                                            const abordajeData = ab.abordaje || ab;
                                            return {
                                                id: abordajeData.codigoAbordaje,
                                                label: `${abordajeData.codigoAbordaje} - ${new Date(abordajeData.fechaAbordaje || abordajeData.fecha).toLocaleDateString()}`
                                            };
                                        })}
                                        value={selectedSetup.codigoAbordaje}
                                        onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, codigoAbordaje: val }))}
                                        placeholder="Busque y seleccione el abordaje activo"
                                        searchPlaceholder="Buscar por código..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="2. Seleccione el Paciente"
                                        items={pacientes.map((p: any) => ({
                                            id: p.cedulaPaciente,
                                            label: `${p.nombrePaciente || p.nombre} ${p.apellidoPaciente || p.apellido}`,
                                            secondaryLabel: `V-${p.cedulaPaciente}`
                                        }))}
                                        value={selectedSetup.cedulaPaciente}
                                        onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaPaciente: val }))}
                                        placeholder="Busque por nombre o cédula"
                                        searchPlaceholder="Buscar paciente..."
                                        disabled={!pacientes || pacientes.length === 0}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="3. Médico Tratante"
                                        items={medicos.map((m: any) => ({
                                            id: m.cedulaTejedor,
                                            label: `Dr(a). ${m.tejedor?.nombreTejedor || m.tejedor?.nombre1} ${m.tejedor?.apellidoTejedor || m.tejedor?.apellido1}`,
                                            secondaryLabel: m.especialidad?.nombreEspecialidad || m.codigoEspecialidad
                                        }))}
                                        value={selectedSetup.cedulaMedico}
                                        onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaMedico: val }))}
                                        placeholder="Seleccione el médico a cargo"
                                        searchPlaceholder="Buscar médico..."
                                    />
                                </div>

                                <Button 
                                    onClick={handleSetupNext} 
                                    disabled={isLoading} 
                                    className="w-full h-12 mt-8 text-base font-bold bg-[#1e3a8a] hover:bg-blue-900 rounded-xl text-white"
                                >
                                    {isLoading ? 'Cargando expediente...' : 'Comenzar Atención Médica'}
                                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                                </Button>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="pt-4">
                        <ConsultaWizard 
                            paciente={selectedPacienteRecord}
                            medico={selectedMedicoRecord}
                            abordaje={selectedAbordajeRecord}
                            enfermedadesDisponibles={enfermedades}
                            initialData={wizardInitialData}
                            onSave={handleWizardSave}
                            onCancel={handleWizardCancel}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </PageShell>
        </MainLayout>
    );
}
