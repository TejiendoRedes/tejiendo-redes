'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Home, MapPin, Eye, Download, Building2, Trees, Map, CheckCircle2, Navigation, Plus } from 'lucide-react';
import { Comunidad } from '@/db/schema/comunidades';
import { Responsable } from '@/db/schema/responsable';
import { createComunidad, deleteComunidad, updateComunidad } from '@/actions/comunidades-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ComunidadForm } from '@/components/forms/ComunidadForm';
import { Badge } from '@/components/ui/badge';

type ComunidadWithGeo = Comunidad & {
    estadoNombre?: string | null;
    municipioNombre?: string | null;
    parroquiaNombre?: string | null;
    responsable?: Responsable | null;
};

interface ComunidadesClientProps {
    initialData: ComunidadWithGeo[];
    responsables: Responsable[];
    canManage?: boolean;
}

export default function ComunidadesClient({ initialData, responsables, canManage = false }: ComunidadesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingComunidad, setEditingComunidad] = React.useState<ComunidadWithGeo | null>(null);
    const [viewingComunidad, setViewingComunidad] = React.useState<ComunidadWithGeo | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAdd = () => {
        setEditingComunidad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (comunidad: Comunidad) => {
        setEditingComunidad(comunidad);
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta comunidad?')) {
            const res = await deleteComunidad(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            let res;
            if (editingComunidad) {
                res = await updateComunidad(editingComunidad.codigoComunidad, data);
            } else {
                res = await createComunidad(data);
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
    const getLocationNames = (comunidad: ComunidadWithGeo) => {
        const { estadoNombre, municipioNombre, parroquiaNombre } = comunidad;
        if (!estadoNombre || !municipioNombre || !parroquiaNombre) return '-';
        return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
    };
    
    const getTipoComunidadConfig = (tipoId: string) => {
        switch (tipoId) {
            case '1': return { label: 'Urbana', className: 'bg-blue-50 text-blue-700 border-blue-200' };
            case '2': return { label: 'Rural', className: 'bg-amber-50 text-amber-700 border-amber-200' };
            case '3': return { label: 'Indígena', className: 'bg-purple-50 text-purple-700 border-purple-200' };
            case '4': return { label: 'Base de Misiones', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            default: return { label: tipoId, className: 'bg-gray-50 text-gray-700 border-gray-200' };
        }
    };


    const columns: Column<Comunidad>[] = [
        {
            key: 'codigoComunidad',
            header: 'Código',
            className: 'w-[1%] whitespace-nowrap',
        },
        {
            key: 'nombreComunidad',
            header: 'Nombre',
        },
        {
            key: 'ubicacion',
            header: 'Ubicación',
            render: (c) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{getLocationNames(c)}</span>
                </div>
            ),
        },
        {
            key: 'tipoComunidad',
            header: 'Tipo',
            className: 'w-[1%] whitespace-nowrap',
            render: (c) => {
                const config = getTipoComunidadConfig(c.tipoComunidad);
                return (
                    <Badge variant="outline" className={config.className}>
                        {config.label}
                    </Badge>
                );
            }
        },
        ...(canManage ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (c: any) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingComunidad(c)}
                        title="Ver detalles"
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(c)}
                        title="Editar"
                        className="hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a] text-gray-500 h-8 w-8 p-0"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c.codigoComunidad)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (c: any) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingComunidad(c)}
                        title="Ver detalles"
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            )
        }]),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(c => {
            const config = getTipoComunidadConfig(c.tipoComunidad);
            const resp = responsables.find(r => r.cedulaResponsable === c.cedulaResponsable);
            const respNombre = resp ? `${resp.nombreResponsable} ${resp.apellidoResponsable}` : 'No asignado';
            return {
                codigo: c.codigoComunidad,
                nombre: c.nombreComunidad,
                tipo: config.label,
                ubicacion: getLocationNames(c),
                habitantes: c.cantidadHabitantes || 0,
                familias: c.cantidadFamilias || 0,
                responsable: respNombre
            };
        });

        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Tipo', dataKey: 'tipo' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
            { header: 'Habitantes', dataKey: 'habitantes' as const },
            { header: 'Familias', dataKey: 'familias' as const },
            { header: 'Responsable', dataKey: 'responsable' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'comunidades'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'comunidades', 'Reporte de Comunidades'));
        }
    };

    return (
        <MainLayout>
            <PageShell 
                title="Comunidades" 
                subtitle="Gestión de las comunidades atendidas"
                actions={
                    <div className="flex gap-2">
                        {canManage && (
                            <Button 
                                onClick={handleAdd}
                                className="bg-[#1e3a8a] text-white hover:bg-blue-800"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Comunidad
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            onClick={() => handleExport('pdf')} 
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Comunidades</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Map className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Urbanas / Rurales</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(c => c.tipoComunidad === '1' || c.tipoComunidad === '2').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                                <Trees className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bases de Misiones</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(c => c.tipoComunidad === '4').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                                <Navigation className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de comunidades"
                    description="Busca por nombre o código y usa el botón de filtros"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreComunidad', 'codigoComunidad']}
                    searchPlaceholder="Buscar comunidad..."
                    filters={[
                        {
                            key: 'tipoComunidad',
                            label: 'Tipo',
                            options: [
                                { label: 'Urbana', value: '1' },
                                { label: 'Rural', value: '2' },
                                { label: 'Indígena', value: '3' },
                                { label: 'Base de Misiones', value: '4' }
                            ]
                        }
                    ]}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Home className="w-6 h-6 text-[#1e3a8a]" />
                                {editingComunidad ? 'Editar Comunidad' : 'Nueva Comunidad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información detallada de la comunidad.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="pt-2">
                            <ComunidadForm
                                initialData={editingComunidad || undefined}
                                responsables={responsables}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsModalOpen(false)}
                                isLoading={isLoading}
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Modal de Ver Detalles */}
                <Dialog open={!!viewingComunidad} onOpenChange={(open) => !open && setViewingComunidad(null)}>
                    <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md rounded-[24px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2 text-gray-900">
                                <MapPin className="w-6 h-6 text-[#1e3a8a]" />
                                Detalles de la Comunidad
                            </DialogTitle>
                        </DialogHeader>
                        
                        {viewingComunidad && (
                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 font-medium">Código</p>
                                        <p className="text-gray-900 font-semibold">{viewingComunidad.codigoComunidad}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 font-medium">Nombre</p>
                                        <p className="text-gray-900 font-semibold">{viewingComunidad.nombreComunidad}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 font-medium">Ubicación</p>
                                        <p className="text-gray-900">{getLocationNames(viewingComunidad)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 font-medium">Tipo</p>
                                        <div>
                                            <Badge variant="outline" className={getTipoComunidadConfig(viewingComunidad.tipoComunidad).className}>
                                                {getTipoComunidadConfig(viewingComunidad.tipoComunidad).label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-sm text-gray-500 font-medium">Responsable</p>
                                        <p className="text-gray-900">
                                            {responsables.find(r => r.cedulaResponsable === viewingComunidad.cedulaResponsable) 
                                                ? `${responsables.find(r => r.cedulaResponsable === viewingComunidad.cedulaResponsable)?.nombreResponsable} ${responsables.find(r => r.cedulaResponsable === viewingComunidad.cedulaResponsable)?.apellidoResponsable}`
                                                : 'No asignado'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout>
    );
}
