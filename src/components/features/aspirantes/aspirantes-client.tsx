'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, Clipboard, Loader2, UserPlus } from 'lucide-react';
import { Aspirante } from '@/db/schema/aspirantes';
import { createAspirante, deleteAspirante, updateAspirante } from '@/actions/aspirantes-actions';
import { promoteAspiranteToTejedor } from '@/actions/promote-aspirante';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { Badge } from '@/components/ui/badge';
import { AspiranteForm } from '@/components/forms/AspiranteForm';

interface AspirantesClientProps {
    initialData: Aspirante[];
}

export default function AspirantesClient({ initialData }: AspirantesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingAspirante, setEditingAspirante] = React.useState<Aspirante | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPromoting, setIsPromoting] = React.useState<string | null>(null);

    const handlePromote = async (aspirante: Aspirante) => {
        if (!confirm(`¿Deseas promover a ${aspirante.nombreAspirante} ${aspirante.apellidoAspirante} a Tejedor Oficial?`)) return;
        setIsPromoting(aspirante.cedulaAspirante);
        try {
            const res = await promoteAspiranteToTejedor(aspirante.cedulaAspirante);
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
        { key: 'cedulaAspirante', label: 'Cédula', sortable: true },
        {
            key: 'nombreAspirante',
            label: 'Aspirante',
            render: (asp) => `${asp.nombreAspirante} ${asp.apellidoAspirante}`,
            sortable: true
        },
        { key: 'profesionAspirante', label: 'Profesión', sortable: true },
        {
            key: 'direccionCompleta',
            label: 'Dirección',
            render: (asp) => {
                const estadoNombre = getEstadoNombre(asp.estadoDireccionAspirante);
                const municipioNombre = getMunicipioNombre(asp.estadoDireccionAspirante, asp.municipioAspirante);
                const parroquiaNombre = getParroquiaNombre(asp.estadoDireccionAspirante, asp.municipioAspirante, asp.parroquiaAspirante);

                return (
                    <div className="text-sm">
                        <div>{asp.direccionAspirante}</div>
                        <div className="text-gray-600">
                            {parroquiaNombre}, {municipioNombre}, {estadoNombre}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'telefonoAspirante',
            label: 'Teléfono',
            render: (asp) => (
                <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{asp.telefonoAspirante}</span>
                </div>
            ),
        },
        {
            key: 'estadoAspirante',
            label: 'Estado',
            render: (asp) => (
                <Badge variant={asp.estadoAspirante === 'Pendiente' ? 'outline' : 'default'}>
                    {asp.estadoAspirante}
                </Badge>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (asp) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asp)} disabled={!!isPromoting}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asp.cedulaAspirante)} disabled={!!isPromoting}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        title="Aprobar como Tejedor"
                        onClick={() => handlePromote(asp)}
                        disabled={isPromoting === asp.cedulaAspirante}
                    >
                        {isPromoting === asp.cedulaAspirante ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <UserPlus className="w-4 h-4 text-green-600" />}
                    </Button>
                </div>
            ),
        },
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

        const headers = ['cedula', 'nombre', 'profesion', 'direccion', 'telefono', 'estado'];
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
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Aspirantes</h1>
                    <p className="text-gray-600">Lista de espera y postulaciones para nuevos tejedores</p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula o nombre..."
                    onAdd={handleAdd}
                    addLabel="Nueva Postulación"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Clipboard className="w-6 h-6 text-blue-600" />
                                {editingAspirante ? 'Editar Aspirante' : 'Registrar Aspirante'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="pt-6">
                            <AspiranteForm
                                initialData={editingAspirante || undefined}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsModalOpen(false)}
                                isLoading={isLoading}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}