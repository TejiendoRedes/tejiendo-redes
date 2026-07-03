'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserCheck, MapPin, Download, Briefcase, UserPlus } from 'lucide-react';
import { Responsable } from '@/db/schema/responsable';
import { createResponsable, deleteResponsable, updateResponsable } from '@/actions/responsables-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { ResponsableForm } from '@/components/forms/ResponsableForm';

interface ResponsablesClientProps {
    initialData: Responsable[];
    canManage?: boolean;
}

export default function ResponsablesClient({ initialData, canManage = false }: ResponsablesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingResponsable, setEditingResponsable] = React.useState<Responsable | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAdd = () => {
        setEditingResponsable(null);
        setIsModalOpen(true);
    };

    const handleEdit = (r: Responsable) => {
        setEditingResponsable(r);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar este responsable?')) {
            const res = await deleteResponsable(cedula);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            let res;
            if (editingResponsable) {
                res = await updateResponsable(editingResponsable.cedulaResponsable, formData);
            } else {
                res = await createResponsable(formData);
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

    // Función para obtener nombres de ubicación
    const getLocationNames = (r: Responsable) => {
        const estado = (r as any).estado;
        const municipio = (r as any).municipio;
        const parroquia = (r as any).parroquia;

        if (!estado || !municipio || !parroquia) return '-';

        const estadoNombre = getEstadoNombre(estado);
        const municipioNombre = getMunicipioNombre(estado, municipio);
        const parroquiaNombre = getParroquiaNombre(estado, municipio, parroquia);

        if (parroquia) {
            return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
        }
        return `${estadoNombre}, ${municipioNombre}`;
    };

    const columns: Column<Responsable>[] = [
        {
            key: 'cedulaResponsable',
            header: 'Cédula',
            className: 'w-[1%] whitespace-nowrap font-mono text-[#1e3a8a] font-medium',
        },
        {
            key: 'nombreResponsable',
            header: 'Nombre Completo',
            render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                        {r.nombreResponsable.charAt(0)}{r.apellidoResponsable.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{r.nombreResponsable} {r.apellidoResponsable}</span>
                        <span className="text-xs text-gray-500">{r.correoResponsable}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'cargo',
            header: 'Cargo',
            render: (r) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {r.cargo}
                </span>
            )
        },
        {
            key: 'ubicacion',
            header: 'Ubicación',
            render: (r) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 max-w-[200px]" title={getLocationNames(r)}>
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{getLocationNames(r)}</span>
                </div>
            ),
        },
        {
            key: 'telefonoResponsable',
            header: 'Teléfono',
            className: 'text-gray-600 text-sm whitespace-nowrap'
        },
        ...(canManage ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (r: any) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEdit(r)}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => handleDelete(r.cedulaResponsable)}
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : []),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(r => ({
            cedula: r.cedulaResponsable,
            nombre: `${r.nombreResponsable} ${r.apellidoResponsable}`,
            cargo: r.cargo,
            ubicacion: getLocationNames(r),
            telefono: r.telefonoResponsable,
            correo: r.correoResponsable,
        }));

        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Cargo', dataKey: 'cargo' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
            { header: 'Correo', dataKey: 'correo' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'responsables'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'responsables', 'Reporte de Responsables'));
        }
    };

    const uniqueCargos = Array.from(new Set(initialData.map(r => r.cargo).filter(Boolean)));
    const filterOptions = uniqueCargos.map(c => ({ label: c as string, value: c as string }));

    return (
        <MainLayout>
            <PageShell
                title="Responsables"
                subtitle="Gestión de líderes y responsables de comunidades."
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
                                <UserPlus className="w-4 h-4 mr-2" />
                                Agregar Responsable
                            </Button>
                        )}
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Responsables</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Cargos Distintos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {uniqueCargos.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de Responsables"
                    description="Busca por nombre, cédula o usa el filtro por cargo"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreResponsable', 'apellidoResponsable', 'cedulaResponsable']}
                    searchPlaceholder="Buscar por nombre o cédula..."
                    filters={filterOptions.length > 0 ? [
                        {
                            key: 'cargo',
                            label: 'Filtrar por Cargo',
                            options: filterOptions
                        }
                    ] : undefined}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[700px] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <DialogTitle className="text-2xl flex items-center gap-3 text-[#1e3a8a]">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <UserCheck className="w-6 h-6 text-[#1e3a8a]" />
                                </div>
                                {editingResponsable ? 'Editar Responsable' : 'Nuevo Responsable'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 pt-1">
                                Ingrese los datos del responsable de comunidad. Todos los campos con * son obligatorios.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="pt-6">
                            <ResponsableForm
                                initialData={editingResponsable || undefined}
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
