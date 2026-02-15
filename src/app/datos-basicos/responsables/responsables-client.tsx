'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserCheck, MapPin } from 'lucide-react';
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
}

export default function ResponsablesClient({ initialData }: ResponsablesClientProps) {
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
            label: 'Cédula',
            sortable: true,
            render: (r) => <span className="font-medium text-gray-700">{r.cedulaResponsable}</span>
        },
        {
            key: 'nombreResponsable', // Virtual key sort requires implementation in DataTable but key is required
            label: 'Nombre Completo',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{r.nombreResponsable} {r.apellidoResponsable}</span>
                    <span className="text-xs text-gray-500">{r.correoResponsable}</span>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'cargo',
            label: 'Cargo',
            sortable: true,
            render: (r) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {r.cargo}
                </span>
            )
        },
        {
            key: 'ubicacion',
            label: 'Ubicación',
            render: (r) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate max-w-[150px]" title={getLocationNames(r)}>
                        {getLocationNames(r)}
                    </span>
                </div>
            ),
        },
        {
            key: 'telefonoResponsable',
            label: 'Teléfono',
            render: (r) => <span className="text-gray-600">{r.telefonoResponsable}</span>
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (r) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
                        <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.cedulaResponsable)}>
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Responsables Comunitario</h1>
                        <p className="text-gray-600 font-medium">Gestión de líderes y responsables de comunidades.</p>
                    </div>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por nombre, cédula o cargo..."
                    onAdd={handleAdd}
                    addLabel="Agregar Responsable"
                    onExport={(format) => toast.info(`Exportando en formato ${format.toUpperCase()}...`)}
                />

                {/* Modal Formulario */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px] border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <DialogTitle className="text-2xl flex items-center gap-3 text-gray-900">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserCheck className="w-6 h-6 text-blue-600" />
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
            </div>
        </MainLayout>
    );
}
