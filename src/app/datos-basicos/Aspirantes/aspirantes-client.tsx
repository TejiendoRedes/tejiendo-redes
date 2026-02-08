'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, ClipboardList } from 'lucide-react';
import { Aspirante } from '@/db/schema/aspirantes'; 
import { createAspirante, updateAspirante, deleteAspirante } from '@/actions/aspirantes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AspirantesClientProps {
    initialData: Aspirante[];
}

export default function AspirantesClient({ initialData }: AspirantesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingAspirante, setEditingAspirante] = React.useState<Aspirante | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const initialFormState = {
        cedulaAspirante: '',
        nombreAspirante: '',
        apellidoAspirante: '',
        fechaNacimiento: '',
        direccionAspirante: '',
        telefonoAspirante: '',
        correoAspirante: '',
        profesionAspirante: '',
        fechaPostulacion: new Date().toISOString().split('T')[0],
        estadoAspirante: 'Pendiente', // Para la lista de espera
    };

    const [formData, setFormData] = React.useState(initialFormState);

    const handleAdd = () => {
        setEditingAspirante(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleEdit = (aspirante: Aspirante) => {
        setEditingAspirante(aspirante);
        setFormData({
            cedulaAspirante: aspirante.cedulaAspirante,
            nombreAspirante: aspirante.nombreAspirante,
            apellidoAspirante: aspirante.apellidoAspirante,
            fechaNacimiento: new Date(aspirante.fechaNacimiento).toISOString().split('T')[0],
            direccionAspirante: aspirante.direccionAspirante,
            telefonoAspirante: aspirante.telefonoAspirante,
            correoAspirante: aspirante.correoAspirante,
            profesionAspirante: aspirante.profesionAspirante,
            fechaPostulacion: new Date(aspirante.fechaPostulacion).toISOString().split('T')[0],
            estadoAspirante: aspirante.estadoAspirante,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar esta postulación?')) {
            const res = await deleteAspirante(cedula);
            if (res.success) {
                toast.success('Postulación eliminada');
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToSave = {
                ...formData,
                fechaNacimiento: new Date(formData.fechaNacimiento),
                fechaPostulacion: new Date(formData.fechaPostulacion),
            };

            let res;
            if (editingAspirante) {
                res = await updateAspirante(editingAspirante.cedulaAspirante, dataToSave);
            } else {
                res = await createAspirante(dataToSave);
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

    const columns: Column<Aspirante>[] = [
        {
            key: 'cedulaAspirante',
            label: 'Cédula',
            sortable: true,
        },
        {
            key: 'nombreAspirante',
            label: 'Aspirante',
            render: (asp) => `${asp.nombreAspirante} ${asp.apellidoAspirante}`,
            sortable: true,
        },
        {
            key: 'profesionAspirante',
            label: 'Profesión',
            sortable: true,
        },
        {
            key: 'estadoAspirante',
            label: 'Estado',
            render: (asp) => (
                <Badge variant={asp.estadoAspirante === 'Pendiente' ? 'outline' : 'default'}>
                    {asp.estadoAspirante}
                </Badge>
            ),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (asp) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asp)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asp.cedulaAspirante)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                    {/* Botón sugerido para "Convertir en Tejedor" más adelante */}
                    <Button variant="ghost" size="sm" title="Aprobar como Tejedor">
                        <UserPlus className="w-4 h-4 text-green-600" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl text-gray-900 mb-2">Aspirantes</h1>
                    <p className="text-gray-600">
                        Lista de espera y postulaciones para nuevos tejedores
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula o nombre..."
                    onAdd={handleAdd}
                    addLabel="Nueva Postulación"
                    onExport={(format) => toast.info(`Exportando lista de aspirantes...`)}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <ClipboardList className="w-6 h-6 text-blue-600" />
                                {editingAspirante ? 'Editar Aspirante' : 'Registrar Aspirante'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cedula">Cédula *</Label>
                                    <Input
                                        id="cedula"
                                        value={formData.cedulaAspirante}
                                        onChange={(e) => setFormData({ ...formData, cedulaAspirante: e.target.value })}
                                        required
                                        disabled={!!editingAspirante}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombreAspirante}
                                        onChange={(e) => setFormData({ ...formData, nombreAspirante: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input
                                        id="apellido"
                                        value={formData.apellidoAspirante}
                                        onChange={(e) => setFormData({ ...formData, apellidoAspirante: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaPostulacion">Fecha Postulación *</Label>
                                    <Input
                                        id="fechaPostulacion"
                                        type="date"
                                        value={formData.fechaPostulacion}
                                        onChange={(e) => setFormData({ ...formData, fechaPostulacion: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profesion">Profesión *</Label>
                                    <Input
                                        id="profesion"
                                        value={formData.profesionAspirante}
                                        onChange={(e) => setFormData({ ...formData, profesionAspirante: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        value={formData.telefonoAspirante}
                                        onChange={(e) => setFormData({ ...formData, telefonoAspirante: e.target.value })}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="px-8 bg-blue-600 text-white" disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar Postulación'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}