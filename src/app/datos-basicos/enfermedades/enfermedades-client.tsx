'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, Stethoscope } from 'lucide-react'; // Stethoscope for diseases

import type { Enfermedad, NewEnfermedad } from '@/db/schema/enfermedades';
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
}

export default function EnfermedadesClient({ initialData }: EnfermedadesClientProps) {
    const router = useRouter();
    // We can rely on initialData and router.refresh() or keep local state.
    // Given the pattern in other clients, we'll try to rely on router.refresh for simplicity, 
    // but the previous code used local state 'enfermedades'. 
    // To match other refactors (e.g. Medicamentos), we usually use initialData prop directly in DataTable 
    // and rely on router.refresh() to update it.

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
            label: 'Código',
            sortable: true,
        },
        {
            key: 'nombreEnfermedad',
            label: 'Nombre',
            sortable: true,
        },
        {
            key: 'tipoPatologia',
            label: 'Tipo Patología',
            sortable: true,
        },
        {
            key: 'descripcion',
            label: 'Descripción',
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (enfermedad) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(enfermedad)}
                        title="Editar"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enfermedad.codigoEnfermedad)}
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(e => ({
            codigo: e.codigoEnfermedad,
            nombre: e.nombreEnfermedad,
            tipo: e.tipoPatologia || '-',
            descripcion: e.descripcion || '-',
        }));

        const headers = ['codigo', 'nombre', 'tipo', 'descripcion'];
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

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
                        <Stethoscope className="w-8 h-8 text-blue-600" />
                        Enfermedades
                    </h1>
                    <p className="text-gray-600">
                        Catálogo de enfermedades para estandarizar diagnósticos
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por código, nombre o tipo..."
                    onAdd={handleAdd}
                    addLabel="Agregar Enfermedad"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                                {editingEnfermedad ? 'Editar Enfermedad' : 'Nueva Enfermedad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles de la enfermedad.
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
            </div>
        </MainLayout>
    );
}
