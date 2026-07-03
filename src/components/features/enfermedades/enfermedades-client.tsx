'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, Stethoscope, Download, HeartPulse } from 'lucide-react'; // Stethoscope for diseases

import type { Enfermedad } from '@/db/schema/enfermedades';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createEnfermedad, updateEnfermedad, deleteEnfermedad } from '@/actions/enfermedades-actions';
import { EnfermedadForm } from '@/components/forms/EnfermedadForm';
import { useRouter } from 'next/navigation';

interface EnfermedadesClientProps {
    initialData: Enfermedad[];
    canEdit?: boolean;
}

export default function EnfermedadesClient({ initialData, canEdit = false }: EnfermedadesClientProps) {
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEnfermedad, setEditingEnfermedad] = React.useState<Enfermedad | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAdd = () => {
        setEditingEnfermedad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (enfermedad: Enfermedad) => {
        setEditingEnfermedad(enfermedad);
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta enfermedad?')) {
            const res = await deleteEnfermedad(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error || 'Error al eliminar');
            }
        }
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);

        try {
            let res;
            if (editingEnfermedad) {
                res = await updateEnfermedad(editingEnfermedad.codigoEnfermedad, data);
            } else {
                res = await createEnfermedad(data);
            }

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Error al guardar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Enfermedad>[] = [
        {
            key: 'codigoEnfermedad',
            header: 'Código',
            className: 'w-[1%] whitespace-nowrap font-mono text-[#1e3a8a] font-medium',
        },
        {
            key: 'nombreEnfermedad',
            header: 'Nombre',
            className: 'font-semibold text-gray-900',
        },
        {
            key: 'tipoPatologia',
            header: 'Tipo Patología',
        },
        {
            key: 'descripcion',
            header: 'Descripción',
            render: (e) => (
                <p className="max-w-md truncate text-gray-500 text-sm" title={e.descripcion || ''}>
                    {e.descripcion || '-'}
                </p>
            )
        },
        ...(canEdit ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (e: any) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(e)}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(e.codigoEnfermedad)}
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : []),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(e => ({
            codigo: e.codigoEnfermedad,
            nombre: e.nombreEnfermedad,
            tipo: e.tipoPatologia || '-',
            descripcion: e.descripcion || '-',
        }));

        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Tipo Patología', dataKey: 'tipo' as const },
            { header: 'Descripción', dataKey: 'descripcion' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'enfermedades'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'enfermedades', 'Reporte de Enfermedades'));
        }
    };

    // Extract unique pathology types for filtering
    const uniqueTypes = Array.from(new Set(initialData.map(e => e.tipoPatologia).filter(Boolean)));
    const filterOptions = uniqueTypes.map(t => ({ label: t as string, value: t as string }));

    return (
        <MainLayout>
            <PageShell
                title="Enfermedades"
                subtitle="Catálogo maestro de enfermedades y patologías"
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
                        {canEdit && (
                            <Button 
                                onClick={handleAdd} 
                                className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                            >
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Agregar Enfermedad
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Enfermedades</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <HeartPulse className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de enfermedades"
                    description="Busca por nombre o código y usa el filtro por tipo de patología"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreEnfermedad', 'codigoEnfermedad', 'tipoPatologia']}
                    searchPlaceholder="Buscar enfermedad..."
                    filters={filterOptions.length > 0 ? [
                        {
                            key: 'tipoPatologia',
                            label: 'Tipo de Patología',
                            options: filterOptions
                        }
                    ] : undefined}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Stethoscope className="w-6 h-6 text-[#1e3a8a]" />
                                {editingEnfermedad ? 'Editar Enfermedad' : 'Nueva Enfermedad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles de la enfermedad para el catálogo.
                            </DialogDescription>
                        </DialogHeader>

                        <EnfermedadForm
                            initialData={editingEnfermedad || undefined}
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
