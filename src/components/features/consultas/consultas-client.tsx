'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, User, Stethoscope, FileText, ArrowRight, Download, Plus, ClipboardList, Eye } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { toast } from 'sonner';

import type { Enfermedad } from '@/db/schema/enfermedades';
import { deleteConsulta, saveConsultaWizard } from '@/actions/consultas-actions';
import { getEnfermedadesByConsulta, getAntecedentesByPaciente } from '@/queries/consultas';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ConsultaWizard, type WizardData } from './ConsultaWizard';

interface ConsultasClientProps {
    consultas: any[];
    pacientes: any[];
    medicos: any[];
    abordajes: any[];
    enfermedades: Enfermedad[];
}

export default function ConsultasClient({
    consultas: initialConsultas,
    pacientes,
    medicos,
    abordajes,
    enfermedades
}: ConsultasClientProps) {
    const [consultasData, setConsultasData] = React.useState(initialConsultas);
    const router = useRouter();

    React.useEffect(() => {
        setConsultasData(initialConsultas);
    }, [initialConsultas]);

    // View State
    const [view, setView] = React.useState<'list' | 'wizard'>('list');
    const [isSetupOpen, setIsSetupOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
    const [viewingConsulta, setViewingConsulta] = React.useState<any | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    // Setup State (Step 0)
    const [selectedSetup, setSelectedSetup] = React.useState({
        codigoAbordaje: '',
        cedulaPaciente: '',
        cedulaMedico: ''
    });

    // Wizard Data State
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [wizardInitialData, setWizardInitialData] = React.useState<Partial<WizardData>>({});

    // -- Handlers --
    const handleAddClick = () => {
        setEditingId(null);
        setSelectedSetup({ codigoAbordaje: '', cedulaPaciente: '', cedulaMedico: '' });
        setIsSetupOpen(true);
    };

    const handleSetupNext = async () => {
        if (!selectedSetup.codigoAbordaje || !selectedSetup.cedulaPaciente || !selectedSetup.cedulaMedico) {
            toast.error('Por favor complete todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            // Load patient antecedents if they exist
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
                // Empty for new consultation
                motivoConsulta: '',
                diagnosticoTexto: '',
                enfermedadesIds: [],
                recomendaciones: '',
                tratamiento: '',
            });

            setIsSetupOpen(false);
            setView('wizard');
        } catch (error) {
            toast.error('Error al cargar antecedentes del paciente');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = async (row: any) => {
        setIsLoading(true);
        setEditingId(row.consulta.codigoConsulta);
        setSelectedSetup({
            codigoAbordaje: row.consulta.codigoAbordaje,
            cedulaPaciente: row.consulta.cedulaPaciente,
            cedulaMedico: row.consulta.cedulaMedico
        });

        try {
            // Load patient antecedents
            const antRes = await getAntecedentesByPaciente(row.consulta.cedulaPaciente);
            // Load consultation enfermedades
            const enfRes = await getEnfermedadesByConsulta(row.consulta.codigoConsulta);

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
                // Consultation specific
                motivoConsulta: row.consulta.motivoConsulta || '',
                diagnosticoTexto: row.consulta.diagnosticoTexto || '',
                enfermedadesIds: enfRes.success ? enfRes.data!.map((e: any) => e.codigoEnfermedad) : [],
                recomendaciones: row.consulta.recomendaciones || '',
                tratamiento: row.consulta.tratamiento || '',
            });

            setView('wizard');
        } catch (error) {
            toast.error('Error al cargar datos de la consulta');
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
                antecedentesData,
                editingId || undefined
            );

            if (res.success) {
                toast.success(res.message);
                setView('list');
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado al guardar la consulta');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (codigo: string) => {
        const res = await deleteConsulta(codigo);
        if (res.success) {
            setConsultasData(prev => prev.filter(c => c.consulta.codigoConsulta !== codigo));
            toast.success('Consulta eliminada correctamente');
            router.refresh();
        } else {
            toast.error(res.error || 'Error al eliminar');
        }
        setDeleteTarget(null);
    };

    const columns: Column<any>[] = [
        {
            key: 'consulta.codigoConsulta',
            header: 'Código',
            render: (row) => (
                <div className="font-medium text-foreground">
                    {row.consulta.codigoConsulta}
                </div>
            )
        },
        {
            key: 'nombrePaciente',
            header: 'Paciente',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">{row.nombrePaciente || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{row.consulta.cedulaPaciente}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'nombreMedico',
            header: 'Médico',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">{row.nombreMedico || 'Desconocido'}</p>
                        <p className="text-xs text-muted-foreground">{row.consulta.cedulaMedico}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'codigoAbordaje',
            header: 'Abordaje',
            render: (row) => row.codigoAbordaje || row.consulta.codigoAbordaje
        },
        {
            key: 'consulta.motivoConsulta',
            header: 'Motivo',
            render: (row) => (
                <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px] text-sm text-muted-foreground block" title={row.consulta.motivoConsulta}>
                        {row.consulta.motivoConsulta}
                    </span>
                </div>
            )
        },
        {
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingConsulta(row)}
                        disabled={isLoading}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(row)}
                        disabled={isLoading}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(row.consulta.codigoConsulta)}
                        disabled={isLoading}
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = consultasData.map(row => ({
            codigo: row.consulta.codigoConsulta,
            paciente: row.nombrePaciente || row.consulta.cedulaPaciente,
            medico: row.nombreMedico || row.consulta.cedulaMedico,
            abordaje: row.codigoAbordaje || row.consulta.codigoAbordaje,
            motivo: row.consulta.motivoConsulta,
            diagnostico: row.consulta.diagnosticoTexto,
            tratamiento: row.consulta.tratamiento,
            recomendaciones: row.consulta.recomendaciones,
        }));

        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Paciente', dataKey: 'paciente' as const },
            { header: 'Médico', dataKey: 'medico' as const },
            { header: 'Abordaje', dataKey: 'abordaje' as const },
            { header: 'Motivo', dataKey: 'motivo' as const },
            { header: 'Diagnóstico', dataKey: 'diagnostico' as const },
            { header: 'Tratamiento', dataKey: 'tratamiento' as const },
            { header: 'Recomendaciones', dataKey: 'recomendaciones' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'consultas'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'consultas', 'Reporte de Consultas Médicas'));
        }
    };

    const selectedPacienteRecord = pacientes.find(p => p.cedulaPaciente === selectedSetup.cedulaPaciente);
    const selectedMedicoRecord = medicos.find(m => m.cedulaTejedor === selectedSetup.cedulaMedico);
    const selectedAbordajeRecord = abordajes.find(a => {
        const abordajeData = a.abordaje || a;
        return abordajeData.codigoAbordaje === selectedSetup.codigoAbordaje;
    });

    const uniqueAbordajes = Array.from(new Set(consultasData.map(c => c.codigoAbordaje || c.consulta.codigoAbordaje))).map(code => {
        return {
            label: `Abordaje: ${code}`,
            value: code as string
        };
    });

    return (
        <MainLayout>
            {view === 'list' ? (
                <PageShell 
                    title="Historias Clínicas" 
                    subtitle="Registro y gestión de consultas médicas asociadas a abordajes"
                    actions={
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => handleExport('pdf')} 
                                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                            <Button 
                                onClick={handleAddClick} 
                                className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Consulta
                            </Button>
                        </div>
                    }
                >
                    {/* Métricas Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Consultas</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {consultasData.length}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                    <ClipboardList className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pacientes Atendidos</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {new Set(consultasData.map(c => c.consulta.cedulaPaciente)).size}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DataTable
                        title="Listado de historias"
                        description="Busca por paciente, médico o código"
                        data={consultasData}
                        columns={columns}
                        searchKeys={['nombrePaciente', 'nombreMedico', 'codigoAbordaje']}
                        searchPlaceholder="Buscar por paciente o médico..."
                        filters={[
                            {
                                key: 'codigoAbordaje',
                                label: 'Abordaje',
                                options: uniqueAbordajes
                            }
                        ]}
                    />

                    <ConfirmDialog
                        open={!!deleteTarget}
                        onOpenChange={(open) => !open && setDeleteTarget(null)}
                        title="Eliminar consulta"
                        description="¿Está seguro de eliminar esta consulta médica? Toda la información clínica asociada se perderá permanentemente."
                        confirmLabel="Eliminar"
                        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                    />

                    <Dialog open={!!viewingConsulta} onOpenChange={(open) => !open && setViewingConsulta(null)}>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-[#1e3a8a]">
                                    Detalle de Historia Clínica
                                </DialogTitle>
                                <DialogDescription className="hidden">Ver detalles de la historia</DialogDescription>
                            </DialogHeader>
                            {viewingConsulta && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-xl font-bold text-[#1e3a8a]">
                                            <FileText className="w-8 h-8" />
                                        </span>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {viewingConsulta.nombrePaciente || viewingConsulta.consulta.cedulaPaciente}
                                            </p>
                                            <p className="text-sm text-[#1e3a8a] font-medium">
                                                {viewingConsulta.consulta.codigoConsulta} • Abordaje: {viewingConsulta.codigoAbordaje || viewingConsulta.consulta.codigoAbordaje}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[60vh] overflow-y-auto">
                                        <div>
                                            <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Médico Tratante</p>
                                            <p className="font-medium text-gray-900">{viewingConsulta.nombreMedico || viewingConsulta.consulta.cedulaMedico}</p>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Motivo de Consulta</p>
                                            <p className="font-medium text-gray-900">{viewingConsulta.consulta.motivoConsulta || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Diagnóstico</p>
                                            <p className="font-medium text-gray-900 whitespace-pre-wrap">{viewingConsulta.consulta.diagnosticoTexto || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Tratamiento</p>
                                            <p className="font-medium text-gray-900 whitespace-pre-wrap">{viewingConsulta.consulta.tratamiento || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Recomendaciones</p>
                                            <p className="font-medium text-gray-900 whitespace-pre-wrap">{viewingConsulta.consulta.recomendaciones || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                                        <Button 
                                            variant="outline"
                                            onClick={() => {
                                                const row = viewingConsulta;
                                                setViewingConsulta(null);
                                                handleEditClick(row);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar Completo
                                        </Button>
                                        <Button onClick={() => setViewingConsulta(null)} className="bg-[#1e3a8a] text-white hover:bg-blue-800">
                                            Cerrar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </PageShell>
            ) : (
                <div className="pt-4">
                    <ConsultaWizard 
                        paciente={selectedPacienteRecord}
                        medico={selectedMedicoRecord}
                        abordaje={selectedAbordajeRecord}
                        enfermedadesDisponibles={enfermedades}
                        initialData={wizardInitialData}
                        onSave={handleWizardSave}
                        onCancel={() => setView('list')}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Modal de Configuración Inicial (Paso 0) */}
            <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Configurar Nueva Consulta
                        </DialogTitle>
                    </DialogHeader>
                        <div className="space-y-4">
                            <SearchableSelect
                                label="Abordaje"
                                items={abordajes.map((ab: any) => {
                                    const abordajeData = ab.abordaje || ab;
                                    return {
                                        id: abordajeData.codigoAbordaje,
                                        label: `${abordajeData.codigoAbordaje} - ${new Date(abordajeData.fechaAbordaje || abordajeData.fecha).toLocaleDateString()}`
                                    };
                                })}
                                value={selectedSetup.codigoAbordaje}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, codigoAbordaje: val }))}
                                placeholder="Seleccione el abordaje"
                                searchPlaceholder="Buscar por código..."
                            />

                            <SearchableSelect
                                label="Paciente"
                                items={pacientes.map((p: any) => ({
                                    id: p.cedulaPaciente,
                                    label: `${p.nombrePaciente || p.nombre} ${p.apellidoPaciente || p.apellido}`,
                                    secondaryLabel: `V-${p.cedulaPaciente}`
                                }))}
                                value={selectedSetup.cedulaPaciente}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaPaciente: val }))}
                                placeholder="Busque y seleccione el paciente"
                                searchPlaceholder="Buscar paciente..."
                            />

                            <SearchableSelect
                                label="Médico Tratante"
                                items={medicos.map((m: any) => ({
                                    id: m.cedulaTejedor,
                                    label: `Dr(a). ${m.tejedor?.nombreTejedor || m.tejedor?.nombre1} ${m.tejedor?.apellidoTejedor || m.tejedor?.apellido1}`,
                                    secondaryLabel: m.especialidad?.nombreEspecialidad || m.codigoEspecialidad
                                }))}
                                value={selectedSetup.cedulaMedico}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaMedico: val }))}
                                placeholder="Seleccione el médico"
                                searchPlaceholder="Buscar médico..."
                            />
                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSetupOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSetupNext} disabled={isLoading} className="gap-2">
                            {isLoading ? 'Cargando...' : 'Comenzar Atención'}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
