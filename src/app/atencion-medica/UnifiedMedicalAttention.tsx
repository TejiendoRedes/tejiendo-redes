'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Stethoscope, ClipboardList } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { toast } from 'sonner';

import { getAntecedentesByPaciente } from '@/queries/consultas';
import { saveConsultaWizard } from '@/actions/consultas-actions';
import { ConsultaWizard, type WizardData } from '@/components/features/consultas/ConsultaWizard';
import { AbordajeHistorialEstadisticas } from '@/components/atencion-medica/AbordajeHistorialEstadisticas';

interface UnifiedMedicalAttentionProps {
    pacientes: any[];
    comunidades: any[];
    medicos: any[];
    abordajes: any[];
    enfermedades: any[];
    canCreate?: boolean;
}

export default function UnifiedMedicalAttention({
    pacientes,
    comunidades,
    medicos,
    abordajes,
    enfermedades,
    canCreate = false
}: UnifiedMedicalAttentionProps) {
    const router = useRouter();
    const [view, setView] = useState<'setup' | 'wizard' | 'historial'>('setup');
    const [isLoading, setIsLoading] = useState(false);

    // Setup State
    const [tipoConsulta, setTipoConsulta] = useState<'abordaje' | 'comun'>('abordaje');
    const [selectedSetup, setSelectedSetup] = useState({
        codigoAbordaje: '',
        cedulaPaciente: '',
        cedulaMedico: ''
    });

    const [wizardInitialData, setWizardInitialData] = useState<Partial<WizardData>>({});

    const handleSetupNext = async () => {
        if (!selectedSetup.cedulaPaciente || !selectedSetup.cedulaMedico) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
        }

        if (tipoConsulta === 'abordaje' && !selectedSetup.codigoAbordaje) {
            toast.error('Por favor seleccione un abordaje');
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
                codigoAbordaje: tipoConsulta === 'abordaje' ? selectedSetup.codigoAbordaje : undefined,
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

    if (!canCreate) {
        return (
            <MainLayout>
                <PageShell title="Atención Médica" subtitle="Registro de consultas e historias clínicas">
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-red-100 shadow-sm">
                        <Stethoscope className="w-16 h-16 text-red-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Acceso Restringido</h2>
                        <p className="text-gray-500 mt-2 max-w-md">
                            Solo el personal médico y los administradores pueden registrar nuevas consultas médicas. 
                            Si necesitas acceder a las historias clínicas, visita el módulo de consultas.
                        </p>
                        <Button className="mt-6 bg-[#1e3a8a] text-white" onClick={() => router.push('/datos-basicos/consultas')}>
                            Ver Historias Clínicas
                        </Button>
                    </div>
                </PageShell>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <PageShell
                title="Atención Médica"
                subtitle={
                    view === 'historial'
                        ? "Historial y estadísticas de abordajes"
                        : view === 'setup'
                            ? "Consulta clínica · Seleccionar abordaje"
                            : "Consulta clínica · Registro paso a paso"
                }
                actions={
                    view !== 'wizard' ? (
                        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => setView('setup')}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === 'setup' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Activity className="w-4 h-4" />
                                Nueva Consulta
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('historial')}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === 'historial' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <ClipboardList className="w-4 h-4" />
                                Historial de Abordajes
                            </button>
                        </div>
                    ) : undefined
                }
            >
                {view === 'historial' ? (
                    <AbordajeHistorialEstadisticas abordajes={abordajes} />
                ) : view === 'setup' ? (
                    <div className="space-y-6 max-w-2xl mx-auto pt-8">
                        <Card className="p-8 border-none shadow-2xl bg-white rounded-3xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                                <Activity className="w-8 h-8 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Configuración Inicial</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 block">Tipo de Consulta</Label>
                                    <div className="flex flex-col sm:flex-row gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="tipoConsulta" 
                                                value="abordaje" 
                                                checked={tipoConsulta === 'abordaje'} 
                                                onChange={() => setTipoConsulta('abordaje')} 
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-gray-900">En Abordaje Comunitario</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="tipoConsulta" 
                                                value="comun" 
                                                checked={tipoConsulta === 'comun'} 
                                                onChange={() => {
                                                    setTipoConsulta('comun');
                                                    setSelectedSetup(prev => ({ ...prev, codigoAbordaje: '' }));
                                                }} 
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-gray-900">Consulta Común / General</span>
                                        </label>
                                    </div>
                                </div>

                                {tipoConsulta === 'abordaje' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <SearchableSelect
                                            label="Seleccione el Abordaje"
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
                                )}

                                <div className="space-y-2">
                                    <SearchableSelect
                                        label="Seleccione el Paciente"
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
                                        label="Médico Tratante"
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
