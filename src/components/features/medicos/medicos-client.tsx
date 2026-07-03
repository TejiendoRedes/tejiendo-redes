'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Stethoscope, User, ClipboardList, Phone, MapPin, Eye, Download, Plus, Award } from 'lucide-react';
import { Tejedor } from '@/db/schema/tejedores';
import { Especialidad } from '@/db/schema/especialidades';
import { createMedico, deleteMedico, updateMedico } from '@/actions/medicos-actions';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio, getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface MedicoWithRelations {
    cedulaTejedor: string;
    codigoEspecialidad: string;
    matriculaColegioMedico: string;
    matriculaSanidad: string;
    tejedor: Tejedor | null;
    especialidad: Especialidad | null;
}

interface MedicosClientProps {
    initialMedicos: MedicoWithRelations[];
    tejedores: Tejedor[];
    especialidades: Especialidad[];
    isAdmin?: boolean;
}

export default function MedicosClient({ initialMedicos, tejedores, especialidades, isAdmin = false }: MedicosClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewingMedico, setViewingMedico] = React.useState<MedicoWithRelations | null>(null);
    const [activeTab, setActiveTab] = React.useState('tejedor');
    const [isLoading, setIsLoading] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

    const calcularEdad = (fecha: string | Date | null) => {
        if (!fecha) return 0;
        const hoy = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const getLocationNames = (t: Tejedor | null) => {
        if (!t) return '-';
        const estado = (t as any).estadoTejedor;
        const municipio = (t as any).municipioTejedor;
        const parroquia = (t as any).parroquiaTejedor;

        if (!estado || !municipio || !parroquia) return '-';

        const estadoNombre = getEstadoNombre(estado);
        const municipioNombre = getMunicipioNombre(estado, municipio);
        const parroquiaNombre = getParroquiaNombre(estado, municipio, parroquia);

        if (parroquia) {
            return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
        }
        return `${estadoNombre}, ${municipioNombre}`;
    };

    const [formData, setFormData] = React.useState({
        cedulaTejedor: '',
        codigoEspecialidad: '',
        matriculaColegioMedico: '',
        matriculaSanidad: '',
    });

    const [isEditing, setIsEditing] = React.useState(false);

    const tejedoresDisponibles = tejedores.filter(t =>
        !initialMedicos.some(m => m.cedulaTejedor === t.cedulaTejedor)
    );

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({
            cedulaTejedor: '',
            codigoEspecialidad: '',
            matriculaColegioMedico: '',
            matriculaSanidad: '',
        });
        setActiveTab('tejedor');
        setIsModalOpen(true);
    };

    const handleEdit = (medico: MedicoWithRelations) => {
        setIsEditing(true);
        setFormData({
            cedulaTejedor: medico.cedulaTejedor,
            codigoEspecialidad: medico.codigoEspecialidad,
            matriculaColegioMedico: medico.matriculaColegioMedico,
            matriculaSanidad: medico.matriculaSanidad,
        });
        setActiveTab('especialidad');
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        const res = await deleteMedico(cedula);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setDeleteTarget(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cedulaTejedor || !formData.codigoEspecialidad || !formData.matriculaColegioMedico || !formData.matriculaSanidad) {
            toast.error('Por favor complete todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await updateMedico(formData.cedulaTejedor, formData);
            } else {
                res = await createMedico(formData);
            }

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<MedicoWithRelations>[] = [
        {
            key: 'cedulaTejedor',
            header: 'Médico',
            render: (m) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-sm font-bold text-[#1e3a8a]">
                        {m.tejedor ? `${m.tejedor.nombreTejedor[0]}${m.tejedor.apellidoTejedor[0]}` : '?'}
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">
                            {m.tejedor ? `${m.tejedor.nombreTejedor} ${m.tejedor.apellidoTejedor}` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.cedulaTejedor}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'codigoEspecialidad',
            header: 'Especialidad',
            render: (m) => m.especialidad ? m.especialidad.nombreEspecialidad : m.codigoEspecialidad
        },
        {
            key: 'telefono', // Virtual column
            header: 'Teléfono / Correo',
            render: (m) => (
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {m.tejedor?.telefonoTejedor || '-'}
                    </div>
                    {m.tejedor?.correoTejedor && (
                        <div className="text-xs text-muted-foreground">
                            {m.tejedor.correoTejedor}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'ubicacion', // Virtual column
            header: 'Ubicación',
            render: (m) => m.tejedor ? (
                (() => {
                    const estadoNombre = getEstadoNombre(m.tejedor.estadoTejedor);
                    const municipioNombre = getMunicipioNombre(m.tejedor.estadoTejedor, m.tejedor.municipioTejedor);
                    const parroquiaNombre = getParroquiaNombre(m.tejedor.estadoTejedor, m.tejedor.municipioTejedor, m.tejedor.parroquiaTejedor);

                    return (
                        <div className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="text-sm">
                                <div className="font-medium">{estadoNombre || '-'}</div>
                                <div className="text-xs text-muted-foreground">{municipioNombre || '-'}</div>
                            </div>
                        </div>
                    );
                })()
            ) : '-'
        },
        ...(isAdmin ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (m: any) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingMedico(m)}
                        className="hover:bg-blue-50 hover:text-[#1e3a8a] text-gray-500"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(m)}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(m.cedulaTejedor)}
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (m: any) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingMedico(m)}
                        className="hover:bg-blue-50 hover:text-[#1e3a8a] text-gray-500"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            )
        }]),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialMedicos.map(m => {
            const tejedor = m.tejedor;
            const estadoNombre = tejedor ? getEstadoNombre(tejedor.estadoTejedor) : '-';
            const municipioNombre = tejedor ? getMunicipioNombre(tejedor.estadoTejedor, tejedor.municipioTejedor) : '-';
            const parroquiaNombre = tejedor ? getParroquiaNombre(tejedor.estadoTejedor, tejedor.municipioTejedor, tejedor.parroquiaTejedor) : '-';

            return {
                cedula: m.cedulaTejedor,
                nombre: tejedor ? `${tejedor.nombreTejedor} ${tejedor.apellidoTejedor}` : 'N/A',
                especialidad: m.especialidad ? m.especialidad.nombreEspecialidad : m.codigoEspecialidad,
                telefono: tejedor ? tejedor.telefonoTejedor : '-',
                correo: tejedor ? tejedor.correoTejedor : '-',
                ubicacion: `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`,
            };
        });

        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Especialidad', dataKey: 'especialidad' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
            { header: 'Correo', dataKey: 'correo' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'medicos'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'medicos', 'Reporte de Médicos'));
        }
    };

    // Obtenemos especialidades únicas para el filtro
    const uniqueEspecialidades = Array.from(new Set(initialMedicos.map(m => m.codigoEspecialidad))).map(code => {
        const especialidad = especialidades.find(e => e.codigoEspecialidad === code);
        return {
            label: especialidad ? especialidad.nombreEspecialidad : code,
            value: code
        };
    });

    return (
        <MainLayout>
            <PageShell 
                title="Personal de Salud" 
                subtitle="Gestión de médicos registrados en el sistema"
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
                        {isAdmin && (
                            <Button 
                                onClick={handleAdd} 
                                className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Médico
                            </Button>
                        )}
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Médicos Activos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialMedicos.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Especialidades Únicas</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {uniqueEspecialidades.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                                <Award className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de médicos"
                    description="Busca por cédula o código de especialidad"
                    data={initialMedicos}
                    columns={columns}
                    searchKeys={['cedulaTejedor', 'codigoEspecialidad']}
                    searchPlaceholder="Buscar por cédula o especialidad..."
                    filters={[
                        {
                            key: 'codigoEspecialidad',
                            label: 'Especialidad',
                            options: uniqueEspecialidades
                        }
                    ]}
                />

                {/* Modal Formulario con Pestañas */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Stethoscope className="w-6 h-6 text-primary" />
                                {isEditing ? 'Editar Asignación' : 'Asignar Nuevo Médico'}
                            </DialogTitle>
                            <DialogDescription>
                                Complete la información para habilitar a un tejedor como médico activo.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {activeTab === 'tejedor' && (
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-4">
                                            <SearchableSelect
                                                label="Seleccionar Tejedor (Sólo tipo Médico)"
                                                items={isEditing
                                                    ? tejedores.filter(t => t.cedulaTejedor === formData.cedulaTejedor)
                                                    : tejedores.filter(t =>
                                                        t.tipodeVoluntario === 'Médico' &&
                                                        !initialMedicos.some(m => m.cedulaTejedor === t.cedulaTejedor)
                                                    )
                                                }
                                                value={formData.cedulaTejedor}
                                                onValueChange={(val) => setFormData({ ...formData, cedulaTejedor: val })}
                                                placeholder="Busque por nombre o cédula..."
                                                searchPlaceholder="Buscar por nombre o cédula..."
                                                idField="cedulaTejedor"
                                                labelField="nombreTejedor"
                                                secondaryLabelField="apellidoTejedor"
                                                disabled={isEditing}
                                            />
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => setActiveTab('especialidad')}
                                                disabled={!formData.cedulaTejedor}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                                            >
                                                Siguiente: Datos Médicos
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'especialidad' && (
                                    <div className="space-y-6 py-2">
                                        {/* Resumen del Tejedor Seleccionado */}
                                        <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between border border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary p-2 rounded-full">
                                                    <User className="w-5 h-5 text-primary-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-primary font-semibold uppercase tracking-wider">Tejedor Seleccionado</p>
                                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                                        {(() => {
                                                            const t = tejedores.find(tej => tej.cedulaTejedor === formData.cedulaTejedor);
                                                            return t ? `${t.nombreTejedor} ${t.apellidoTejedor}` : 'No seleccionado';
                                                        })()}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">C.I: {formData.cedulaTejedor}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <SearchableSelect
                                                    label="Especialidad Médica *"
                                                    items={especialidades}
                                                    value={formData.codigoEspecialidad}
                                                    onValueChange={(val) => setFormData({ ...formData, codigoEspecialidad: val })}
                                                    placeholder="Seleccione especialidad"
                                                    searchPlaceholder="Buscar por nombre o código..."
                                                    idField="codigoEspecialidad"
                                                    labelField="nombreEspecialidad"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="m_colegio">Matrícula Colegio Médico *</Label>
                                                <Input
                                                    id="m_colegio"
                                                    placeholder="Ej. MPPS-123456"
                                                    value={formData.matriculaColegioMedico}
                                                    onChange={(e) => setFormData({ ...formData, matriculaColegioMedico: e.target.value })}
                                                    className="h-11"
                                                    required
                                                    maxLength={30}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="m_sanidad">Matrícula Sanidad *</Label>
                                                <Input
                                                    id="m_sanidad"
                                                    placeholder="Ej. MS-998877"
                                                    value={formData.matriculaSanidad}
                                                    onChange={(e) => setFormData({ ...formData, matriculaSanidad: e.target.value })}
                                                    className="h-11"
                                                    required
                                                    maxLength={30}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setActiveTab('tejedor')}
                                                disabled={isEditing}
                                            >
                                                Atrás
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                                                disabled={isLoading || !formData.codigoEspecialidad || !formData.matriculaColegioMedico || !formData.matriculaSanidad}
                                            >
                                                {isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Finalizar Asignación')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingMedico} onOpenChange={(open) => !open && setViewingMedico(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#1e3a8a]">
                                Perfil del Médico
                            </DialogTitle>
                            <DialogDescription className="hidden">Ver detalles completos del personal de salud</DialogDescription>
                        </DialogHeader>
                        {viewingMedico && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-xl font-bold text-[#1e3a8a]">
                                        {viewingMedico.tejedor ? `${viewingMedico.tejedor.nombreTejedor[0]}${viewingMedico.tejedor.apellidoTejedor[0]}` : '?'}
                                    </span>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">
                                            {viewingMedico.tejedor ? `${viewingMedico.tejedor.nombreTejedor} ${viewingMedico.tejedor.apellidoTejedor}` : 'N/A'}
                                        </p>
                                        <p className="text-sm text-[#1e3a8a] font-medium">
                                            {viewingMedico.especialidad ? viewingMedico.especialidad.nombreEspecialidad : viewingMedico.codigoEspecialidad}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase">Credenciales Médicas</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Matrícula Colegio</p>
                                        <p className="font-medium">{viewingMedico.matriculaColegioMedico}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Matrícula Sanidad</p>
                                        <p className="font-medium">{viewingMedico.matriculaSanidad}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5 text-xs font-semibold uppercase mt-2">Datos Personales</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">C.I.</p>
                                        <p className="font-medium">{viewingMedico.cedulaTejedor}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Edad</p>
                                        <p className="font-medium">{viewingMedico.tejedor ? `${calcularEdad(viewingMedico.tejedor.fechaNacimiento)} años` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Teléfono</p>
                                        <p className="font-medium">{viewingMedico.tejedor?.telefonoTejedor || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Correo</p>
                                        <p className="font-medium">{viewingMedico.tejedor?.correoTejedor || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Ubicación</p>
                                        <p className="font-medium">{getLocationNames(viewingMedico.tejedor)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button onClick={() => setViewingMedico(null)} variant="outline">
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                    title="Eliminar asignación de médico"
                    description="¿Está seguro de eliminar esta asignación de médico? Esta acción no eliminará al tejedor del sistema."
                    confirmLabel="Eliminar"
                    onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                />
            </PageShell>
        </MainLayout>
    );
}
