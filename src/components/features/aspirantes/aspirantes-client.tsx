'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, Clipboard, Loader2, UserPlus, Download, Plus, Users, Clock, CheckCircle2 } from 'lucide-react';
import { Aspirante } from '@/db/schema/aspirantes';
import { createAspirante, deleteAspirante, updateAspirante, promoverATejedor } from '@/actions/aspirantes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { Badge } from '@/components/ui/badge';
import { AspiranteForm } from '@/components/forms/AspiranteForm';

interface AspirantesClientProps {
    initialData: Aspirante[];
    canManage?: boolean;
}

export default function AspirantesClient({ initialData, canManage = false }: AspirantesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingAspirante, setEditingAspirante] = React.useState<Aspirante | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPromoting, setIsPromoting] = React.useState<string | null>(null);

    const handlePromote = async (aspirante: Aspirante) => {
        if (!confirm(`¿Deseas promover a ${aspirante.nombreAspirante} ${aspirante.apellidoAspirante} a Tejedor Oficial?`)) return;
        setIsPromoting(aspirante.cedulaAspirante);
        try {
            const res = await promoverATejedor(aspirante);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error('Error promoting aspirante:', error);
            toast.error('Error al promover aspirante');
        } finally {
            setIsPromoting(null);
        }
    };

    const handleAdd = () => {
        setEditingAspirante(null);
        setIsModalOpen(true);
    };

    const handleEdit = (aspirante: Aspirante) => {
        setEditingAspirante(aspirante);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar esta postulación?')) {
            const res = await deleteAspirante(cedula);
            if (res.success) {
                toast.success('Eliminado correctamente');
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);

        try {
            const dataToSave = {
                ...formData,
                fechaNacimiento: new Date(formData.fechaNacimiento),
                fechaPostulacion: new Date(formData.fechaPostulacion),
            };

            const res = editingAspirante
                ? await updateAspirante(editingAspirante.cedulaAspirante, dataToSave)
                : await createAspirante(dataToSave);

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error inesperado al guardar');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Aspirante>[] = [
        {
            key: 'nombreAspirante',
            header: 'Aspirante',
            render: (asp) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-sm font-bold text-[#1e3a8a]">
                        {asp.nombreAspirante[0]}{asp.apellidoAspirante[0]}
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">{asp.nombreAspirante} {asp.apellidoAspirante}</p>
                        <p className="text-xs text-muted-foreground">{asp.cedulaAspirante}</p>
                    </div>
                </div>
            ),
        },
        { key: 'profesionAspirante', header: 'Profesión' },
        {
            key: 'direccionCompleta',
            header: 'Dirección',
            render: (asp) => {
                const estadoNombre = getEstadoNombre(asp.estadoDireccionAspirante);
                const municipioNombre = getMunicipioNombre(asp.estadoDireccionAspirante, asp.municipioAspirante);
                const parroquiaNombre = getParroquiaNombre(asp.estadoDireccionAspirante, asp.municipioAspirante, asp.parroquiaAspirante);

                return (
                    <div className="text-sm text-muted-foreground">
                        <div>{asp.direccionAspirante}</div>
                        <div className="text-xs opacity-75">
                            {parroquiaNombre}, {municipioNombre}, {estadoNombre}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'telefonoAspirante',
            header: 'Teléfono',
            render: (asp) => (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {asp.telefonoAspirante || '-'}
                </span>
            ),
        },
        {
            key: 'estadoAspirante',
            header: 'Estado',
            render: (asp) => {
                const isPending = asp.estadoAspirante === 'Pendiente';
                return (
                    <Badge variant={isPending ? 'outline' : 'default'} className={isPending ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}>
                        {asp.estadoAspirante}
                    </Badge>
                );
            }
        },
        ...(canManage ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (asp: any) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asp)} disabled={!!isPromoting}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asp.cedulaAspirante)} disabled={!!isPromoting}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 transition-colors"
                        title="Aprobar como Tejedor"
                        onClick={() => handlePromote(asp)}
                        disabled={isPromoting === asp.cedulaAspirante || asp.estadoAspirante === 'Aprobado'}
                    >
                        {isPromoting === asp.cedulaAspirante ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                        Promover
                    </Button>
                </div>
            ),
        }] : []),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(asp => {
            const estadoNombre = getEstadoNombre(asp.estadoDireccionAspirante);
            const municipioNombre = getMunicipioNombre(asp.estadoDireccionAspirante, asp.municipioAspirante);
            const parroquiaNombre = getParroquiaNombre(asp.estadoDireccionAspirante, asp.municipioAspirante, asp.parroquiaAspirante);

            return {
                cedula: asp.cedulaAspirante,
                nombre: `${asp.nombreAspirante} ${asp.apellidoAspirante}`,
                profesion: asp.profesionAspirante,
                direccion: `${asp.direccionAspirante}, ${parroquiaNombre}, ${municipioNombre}, ${estadoNombre}`,
                telefono: asp.telefonoAspirante,
                estado: asp.estadoAspirante,
            };
        });

        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Profesión', dataKey: 'profesion' as const },
            { header: 'Dirección', dataKey: 'direccion' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
            { header: 'Estado', dataKey: 'estado' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'aspirantes'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'aspirantes', 'Reporte de Aspirantes'));
        }
    };

    return (
        <MainLayout>
            <PageShell
                title="Aspirantes"
                subtitle="Lista de espera y postulaciones para nuevos tejedores"
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
                        {canManage && (
                            <Button
                                onClick={handleAdd}
                                className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Postulación
                            </Button>
                        )}
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Postulaciones</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pendientes</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(a => a.estadoAspirante === 'Pendiente').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Aprobados / Revisados</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(a => a.estadoAspirante !== 'Pendiente').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de aspirantes"
                    description="Busca por nombre, cédula o profesión"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreAspirante', 'apellidoAspirante', 'cedulaAspirante', 'profesionAspirante']}
                    searchPlaceholder="Buscar por cédula, nombre, profesión..."
                    filters={[
                        {
                            key: 'estadoAspirante',
                            label: 'Estado',
                            options: [
                                { label: 'Pendiente', value: 'Pendiente' },
                                { label: 'Aprobado', value: 'Aprobado' },
                                { label: 'Rechazado', value: 'Rechazado' }
                            ]
                        }
                    ]}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-[#1e3a8a]">
                                <UserPlus className="w-6 h-6" />
                                {editingAspirante ? 'Editar Postulación' : 'Nueva Postulación'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="pt-4">
                            <AspiranteForm
                                initialData={editingAspirante || undefined}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsModalOpen(false)}
                                isLoading={isLoading}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout>
    );
}