'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Heart, MapPin, Phone, Plus, Users, User, Download, Eye } from 'lucide-react';
import { Paciente } from '@/db/schema/pacientes';
import { Comunidad } from '@/db/schema/comunidades';
import { createPaciente, deletePaciente, updatePaciente } from '@/actions/pacientes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { PacienteForm } from '@/components/forms/PacienteForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PacienteWithComunidad extends Paciente {
    comunidad: Comunidad | null;
}

interface PacientesClientProps {
    initialData: PacienteWithComunidad[];
    comunidades: Comunidad[];
}

export default function PacientesClient({ initialData, comunidades }: PacientesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewingPaciente, setViewingPaciente] = React.useState<PacienteWithComunidad | null>(null);
    const [editingPaciente, setEditingPaciente] = React.useState<PacienteWithComunidad | null>(null);
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

    const handleAdd = () => {
        setEditingPaciente(null);
        setIsModalOpen(true);
    };

    const handleEdit = (paciente: PacienteWithComunidad) => {
        setEditingPaciente(paciente);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        const res = await deletePaciente(cedula);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setDeleteTarget(null);
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            let res;
            if (editingPaciente) {
                res = await updatePaciente(editingPaciente.cedulaPaciente, data);
            } else {
                res = await createPaciente(data);
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

    const getLocationNames = (paciente: PacienteWithComunidad) => {
        const estado = (paciente as any).estado;
        const municipio = (paciente as any).municipio;
        const parroquia = (paciente as any).parroquia;

        if (!estado || !municipio || !parroquia) return '-';

        const estadoNombre = getEstadoNombre(estado);
        const municipioNombre = getMunicipioNombre(estado, municipio);
        const parroquiaNombre = getParroquiaNombre(estado, municipio, parroquia);

        if (parroquia) {
            return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
        }
        return `${estadoNombre}, ${municipioNombre}`;
    };

    const columns: Column<PacienteWithComunidad>[] = [
        {
            key: 'nombrePaciente',
            header: 'Paciente',
            render: (p) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-sm font-bold text-[#1e3a8a]">
                        {p.nombrePaciente[0]}{p.apellidoPaciente[0]}
                    </span>
                    <div>
                        <p className="font-semibold text-gray-900">{p.nombrePaciente} {p.apellidoPaciente}</p>
                        <p className="text-xs text-gray-500">{p.cedulaPaciente}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'fechaNacimiento',
            header: 'Edad',
            render: (p) => `${calcularEdad(p.fechaNacimiento)} años`,
        },
        {
            key: 'sexo',
            header: 'Sexo',
            render: (p) => (p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A'),
        },
        {
            key: 'telefonoPaciente',
            header: 'Teléfono',
            render: (p) => (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {p.telefonoPaciente || '-'}
                </span>
            ),
        },
        {
            key: 'comunidad',
            header: 'Comunidad / Último abordaje',
            render: (p) => p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
        },
        {
            key: 'ubicacion',
            header: 'Ubicación',
            render: (p) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{getLocationNames(p)}</span>
                </div>
            ),
        },
        {
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (p) => {
                return (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingPaciente(p)}
                            className="hover:bg-blue-50 hover:text-[#1e3a8a] text-gray-500"
                            title="Ver detalles"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p.cedulaPaciente)}
                            className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(p => ({
            cedula: p.cedulaPaciente,
            nombre: `${p.nombrePaciente} ${p.apellidoPaciente}`,
            edad: `${calcularEdad(p.fechaNacimiento)} años`,
            sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A',
            comunidad: p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
            ubicacion: getLocationNames(p),
            telefono: p.telefonoPaciente || '-',
        }));

        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Edad', dataKey: 'edad' as const },
            { header: 'Sexo', dataKey: 'sexo' as const },
            { header: 'Comunidad', dataKey: 'comunidad' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'pacientes'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'pacientes', 'Reporte de Pacientes'));
        }
    };

    return (
        <MainLayout>
            <PageShell 
                title="Pacientes" 
                subtitle="Registro de personas atendidas en jornadas comunitarias"
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
                            onClick={handleAdd} 
                            className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Paciente
                        </Button>
                    </div>
                }
            >
                
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Pacientes</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Femenino</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(p => p.sexo === 'F').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-100">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Masculino</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(p => p.sexo === 'M').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de pacientes"
                    description="Busca por nombre, cédula o teléfono"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombrePaciente', 'apellidoPaciente', 'cedulaPaciente', 'telefonoPaciente']}
                    searchPlaceholder="Buscar por cédula, nombre, teléfono..."
                    filters={[
                        {
                            key: 'sexo',
                            label: 'Sexo',
                            options: [
                                { label: 'Femenino', value: 'F' },
                                { label: 'Masculino', value: 'M' }
                            ]
                        }
                    ]}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Heart className="w-6 h-6 text-primary" />
                                {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información del paciente.
                            </DialogDescription>
                        </DialogHeader>

                        <PacienteForm
                            initialData={editingPaciente || undefined}
                            comunidades={comunidades}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isLoading}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingPaciente} onOpenChange={(open) => !open && setViewingPaciente(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#1e3a8a]">
                                Detalles del Paciente
                            </DialogTitle>
                            <DialogDescription className="hidden">Ver detalles completos del paciente</DialogDescription>
                        </DialogHeader>
                        {viewingPaciente && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-xl font-bold text-[#1e3a8a]">
                                        {viewingPaciente.nombrePaciente[0]}{viewingPaciente.apellidoPaciente[0]}
                                    </span>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{viewingPaciente.nombrePaciente} {viewingPaciente.apellidoPaciente}</p>
                                        <p className="text-sm text-gray-500">C.I. {viewingPaciente.cedulaPaciente}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Edad</p>
                                        <p className="font-medium">{calcularEdad(viewingPaciente.fechaNacimiento)} años</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Sexo</p>
                                        <p className="font-medium">{viewingPaciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Teléfono</p>
                                        <p className="font-medium">{viewingPaciente.telefonoPaciente || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Comunidad Asociada</p>
                                        <p className="font-medium">{viewingPaciente.comunidad?.nombreComunidad || viewingPaciente.codigoComunidad || 'Ninguna'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Ubicación</p>
                                        <p className="font-medium">{getLocationNames(viewingPaciente)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Dirección Detallada</p>
                                        <p className="font-medium">{viewingPaciente.direccionPaciente}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button onClick={() => setViewingPaciente(null)} variant="outline">
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
                    title="Eliminar paciente"
                    description="¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                />
            </PageShell>
        </MainLayout>
    );
}
