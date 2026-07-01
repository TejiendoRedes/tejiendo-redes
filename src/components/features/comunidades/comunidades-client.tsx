'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Home, MapPin, Eye } from 'lucide-react';
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
    const [viewingComunidad, setViewingComunidad] = React.useState<Comunidad | null>(null);
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
                const types: Record<string, string> = { '1': 'Urbana', '2': 'Rural', '3': 'Indígena', '4': 'Base de Misiones' };
                return types[c.tipoComunidad] || c.tipoComunidad;
            }
        },
        {
            key: 'acciones',
            header: '',
            className: 'w-[1%] whitespace-nowrap text-right pr-6',
            render: (c) => (
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
        },
    ];


    return (
        <MainLayout>
            <PageShell 
                title="Comunidades" 
                subtitle="Gestión de las comunidades atendidas"
                actions={
                    <Button onClick={handleAdd} className="gap-2 bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-xl shadow-sm">
                        <Home className="w-4 h-4" />
                        Agregar Comunidad
                    </Button>
                }
            >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <DataTable
                        title="Listado de comunidades"
                        description="Busca por nombre o código"
                        data={initialData}
                        columns={columns}
                        searchKeys={['nombreComunidad', 'codigoComunidad']}
                        searchPlaceholder="Buscar comunidad..."
                    />
                </div>

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
                                        <p className="text-gray-900">
                                            {viewingComunidad.tipoComunidad === '1' ? 'Urbana' : 
                                             viewingComunidad.tipoComunidad === '2' ? 'Rural' : 
                                             viewingComunidad.tipoComunidad === '3' ? 'Indígena' : 
                                             viewingComunidad.tipoComunidad === '4' ? 'Base de Misiones' : 
                                             viewingComunidad.tipoComunidad}
                                        </p>
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
