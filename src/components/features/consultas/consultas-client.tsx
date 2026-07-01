'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, User, Stethoscope, FileText, ArrowRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => handleEditClick(row)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                        <Edit className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                        onClick={() => setDeleteTarget(row.consulta.codigoConsulta)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 hover:border-destructive/40 disabled:opacity-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
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

    return (
        <MainLayout>
            {view === 'list' ? (
                <PageShell title="Consultas Médicas" subtitle="Registro y gestión de consultas médicas asociadas a abordajes">
                    <DataTable
                        title="Listado de consultas"
                        description="Busca por paciente, médico o código"
                        data={consultasData}
                        columns={columns}
                        searchKeys={['nombrePaciente', 'nombreMedico', 'codigoAbordaje']}
                        searchPlaceholder="Buscar por paciente o médico..."
                        primaryAction={{ label: 'Nueva Consulta', onClick: handleAddClick }}
                        onExport={handleExport}
                    />

                    <ConfirmDialog
                        open={!!deleteTarget}
                        onOpenChange={(open) => !open && setDeleteTarget(null)}
                        title="Eliminar consulta"
                        description="¿Está seguro de eliminar esta consulta médica? Toda la información clínica asociada se perderá permanentemente."
                        confirmLabel="Eliminar"
                        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                    />
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
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Abordaje</Label>
                            <Select
                                value={selectedSetup.codigoAbordaje}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, codigoAbordaje: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el abordaje" />
                                </SelectTrigger>
                                <SelectContent>
                                    {abordajes.map((ab: any) => {
                                        const abordajeData = ab.abordaje || ab;
                                        return (
                                            <SelectItem key={abordajeData.codigoAbordaje} value={abordajeData.codigoAbordaje}>
                                                {abordajeData.codigoAbordaje} - {new Date(abordajeData.fechaAbordaje || abordajeData.fecha).toLocaleDateString()}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Paciente</Label>
                            <Select
                                value={selectedSetup.cedulaPaciente}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaPaciente: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Busque y seleccione el paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pacientes.map((p: any) => (
                                        <SelectItem key={p.cedulaPaciente} value={p.cedulaPaciente}>
                                            {p.nombrePaciente || p.nombre} {p.apellidoPaciente || p.apellido} ({p.cedulaPaciente})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Médico Tratante</Label>
                            <Select
                                value={selectedSetup.cedulaMedico}
                                onValueChange={(val) => setSelectedSetup(prev => ({ ...prev, cedulaMedico: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el médico" />
                                </SelectTrigger>
                                <SelectContent>
                                    {medicos.map((m: any) => (
                                        <SelectItem key={m.cedulaTejedor} value={m.cedulaTejedor}>
                                            Dr(a). {m.tejedor?.nombreTejedor || m.tejedor?.nombre1} {m.tejedor?.apellidoTejedor || m.tejedor?.apellido1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
