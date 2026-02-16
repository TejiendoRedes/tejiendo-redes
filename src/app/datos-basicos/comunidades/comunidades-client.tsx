'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Home, MapPin } from 'lucide-react';
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
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { ComunidadForm } from '@/components/forms/ComunidadForm';

interface ComunidadesClientProps {
    initialData: Comunidad[];
    responsables: Responsable[];
}

export default function ComunidadesClient({ initialData, responsables }: ComunidadesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingComunidad, setEditingComunidad] = React.useState<Comunidad | null>(null);
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
    const getLocationNames = (comunidad: Comunidad) => {
        const estado = comunidad.estado;
        const municipio = comunidad.municipio;
        const parroquia = comunidad.parroquia;

        if (!estado || !municipio || !parroquia) return '-';

        const estadoNombre = getEstadoNombre(estado);
        const municipioNombre = getMunicipioNombre(estado, municipio);
        const parroquiaNombre = getParroquiaNombre(estado, municipio, parroquia);

        if (parroquia) {
            return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
        }
        return `${estadoNombre}, ${municipioNombre}`;
    };

    const columns: Column<Comunidad>[] = [
        {
            key: 'codigoComunidad',
            label: 'Código',
            sortable: true,
        },
        {
            key: 'nombreComunidad',
            label: 'Nombre',
            sortable: true,
        },
        {
            key: 'ubicacion',
            label: 'Ubicación',
            render: (c) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{getLocationNames(c)}</span>
                </div>
            ),
        },
        {
            key: 'tipoComunidad',
            label: 'Tipo',
            render: (c) => {
                const types: Record<string, string> = { '1': 'Urbana', '2': 'Rural', '3': 'Indígena', '4': 'Base de Misiones' };
                return types[c.tipoComunidad] || c.tipoComunidad;
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (c) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(c)}
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c.codigoComunidad)}
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const types: Record<string, string> = { '1': 'Urbana', '2': 'Rural', '3': 'Indígena', '4': 'Base de Misiones' };
        const exportData = initialData.map(c => ({
            codigo: c.codigoComunidad,
            nombre: c.nombreComunidad,
            ubicacion: getLocationNames(c),
            tipo: types[c.tipoComunidad] || c.tipoComunidad,
        }));

        const headers = ['codigo', 'nombre', 'ubicacion', 'tipo'];
        const columnsData = [
            { header: 'Código', dataKey: 'codigo' },
            { header: 'Nombre', dataKey: 'nombre' },
            { header: 'Ubicación', dataKey: 'ubicacion' },
            { header: 'Tipo', dataKey: 'tipo' },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, headers, 'comunidades'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'comunidades', 'Reporte de Comunidades'));
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Comunidades</h1>
                    <p className="text-gray-600">
                        Gestión de las comunidades atendidas
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar comunidad..."
                    onAdd={handleAdd}
                    addLabel="Agregar Comunidad"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Home className="w-6 h-6 text-green-600" />
                                {editingComunidad ? 'Editar Comunidad' : 'Nueva Comunidad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información de la comunidad.
                            </DialogDescription>
                        </DialogHeader>

                        <ComunidadForm
                            initialData={editingComunidad || undefined}
                            responsables={responsables}
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
