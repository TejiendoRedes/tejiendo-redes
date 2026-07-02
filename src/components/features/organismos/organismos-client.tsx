'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Building2, Mail, Download, UserCheck } from 'lucide-react';
import { Organismo } from '@/db/schema/organismos';
import { Tejedor } from '@/db/schema/tejedores';
import { createOrganismo, deleteOrganismo, updateOrganismo } from '@/actions/organismos-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { OrganismoForm } from '@/components/forms/OrganismoForm';
import { getEstadoNombre, getMunicipioNombre } from '@/data/venezuela-location';

interface OrganismoWithTejedor extends Organismo {
    tejedor: Tejedor | null;
}

interface OrganismosClientProps {
    initialData: OrganismoWithTejedor[];
    tejedores: Tejedor[];
}

export default function OrganismosClient({ initialData, tejedores }: OrganismosClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingOrganismo, setEditingOrganismo] = React.useState<OrganismoWithTejedor | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAdd = () => {
        setEditingOrganismo(null);
        setIsModalOpen(true);
    };

    const handleEdit = (organismo: OrganismoWithTejedor) => {
        setEditingOrganismo(organismo);
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta institución?')) {
            const res = await deleteOrganismo(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (formData: any) => {
        if (!formData.nombreOrganismo || !formData.cedulaTejedor || !formData.estadoOrganismo || !formData.correoOrganismo) {
            toast.error('Por favor complete los campos obligatorios');
            return;
        }

        setIsLoading(true);
        try {
            let res;
            if (editingOrganismo) {
                res = await updateOrganismo(formData.codigoOrganismo, formData);
            } else {
                res = await createOrganismo(formData);
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

    const columns: Column<OrganismoWithTejedor>[] = [
        {
            key: 'codigoOrganismo',
            header: 'Código',
            className: 'w-[1%] whitespace-nowrap font-mono text-[#1e3a8a] font-medium',
        },
        {
            key: 'nombreOrganismo',
            header: 'Nombre Institución',
            className: 'font-semibold text-gray-900',
        },
        {
            key: 'tipoInstitucion',
            header: 'Tipo',
            render: (o) => (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                    {o.tipoInstitucion || 'No especificado'}
                </span>
            ),
        },
        {
            key: 'tejedor',
            header: 'Tejedor Enlace',
            render: (o) => o.tejedor ? (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {o.tejedor.nombreTejedor.charAt(0)}{o.tejedor.apellidoTejedor.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{o.tejedor.nombreTejedor} {o.tejedor.apellidoTejedor}</span>
                </div>
            ) : <span className="text-sm text-gray-500">{o.cedulaTejedor}</span>,
        },
        {
            key: 'correoOrganismo',
            header: 'Contacto',
            render: (o) => (
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{o.correoOrganismo}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'ubicacion',
            header: 'Ubicación',
            render: (o) => {
                const estadoNombre = getEstadoNombre(o.estadoOrganismo);
                const municipioNombre = getMunicipioNombre(o.estadoOrganismo, o.municipioOrganismo);

                return (
                    <div className="text-xs">
                        <div className="font-medium text-gray-900">{estadoNombre || '-'}</div>
                        <div className="text-gray-500">{municipioNombre || '-'}</div>
                    </div>
                );
            },
        },
        {
            key: 'acciones',
            header: '',
            className: 'w-[1%] whitespace-nowrap text-right pr-6',
            render: (o) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEdit(o)}
                        className="hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a] text-gray-500 h-8 w-8 p-0"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => handleDelete(o.codigoOrganismo)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(o => {
            const estadoNombre = getEstadoNombre(o.estadoOrganismo);
            const municipioNombre = getMunicipioNombre(o.estadoOrganismo, o.municipioOrganismo);

            return {
                codigo: o.codigoOrganismo,
                nombre: o.nombreOrganismo,
                tipo: o.tipoInstitucion || 'N/A',
                tejedor: o.tejedor ? `${o.tejedor.nombreTejedor} ${o.tejedor.apellidoTejedor}` : o.cedulaTejedor,
                correo: o.correoOrganismo,
                telefono: o.telefonoOrganismo || 'N/A',
                ubicacion: `${estadoNombre}, ${municipioNombre}, ${o.paisOrganismo}`,
            };
        });

        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Tipo', dataKey: 'tipo' as const },
            { header: 'Tejedor Enlace', dataKey: 'tejedor' as const },
            { header: 'Correo', dataKey: 'correo' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'instituciones'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'instituciones', 'Reporte de Instituciones'));
        }
    };

    const uniqueTypes = Array.from(new Set(initialData.map(o => o.tipoInstitucion).filter(Boolean)));
    const filterOptions = uniqueTypes.map(t => ({ label: t as string, value: t as string }));

    return (
        <MainLayout>
            <PageShell
                title="Instituciones"
                subtitle="Gestión de instituciones y entes asociados con la organización"
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
                            <Building2 className="w-4 h-4 mr-2" />
                            Agregar Institución
                        </Button>
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Instituciones</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tipos Activos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {uniqueTypes.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de Instituciones"
                    description="Busca por nombre, código o usa el filtro por tipo de institución"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreOrganismo', 'codigoOrganismo']}
                    searchPlaceholder="Buscar institución..."
                    filters={filterOptions.length > 0 ? [
                        {
                            key: 'tipoInstitucion',
                            label: 'Tipo de Institución',
                            options: filterOptions
                        }
                    ] : undefined}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-[#1e3a8a]" />
                                {editingOrganismo ? 'Editar Institución' : 'Registrar Nueva Institución'}
                            </DialogTitle>
                            <DialogDescription>
                                Complete la información institucional y de contacto de la institución.
                            </DialogDescription>
                        </DialogHeader>

                        <OrganismoForm
                            initialData={editingOrganismo || undefined}
                            tejedores={tejedores}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isLoading}
                        />
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout>
    );
}
