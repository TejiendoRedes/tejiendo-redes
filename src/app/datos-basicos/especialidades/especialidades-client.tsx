'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GraduationCap, FileText, Hash } from 'lucide-react';
import { Especialidad } from '@/db/schema/especialidades';
import { createEspecialidad, deleteEspecialidad, updateEspecialidad } from '@/actions/especialidades-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EspecialidadesClientProps {
    initialData: Especialidad[];
}

export default function EspecialidadesClient({ initialData }: EspecialidadesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEspecialidad, setEditingEspecialidad] = React.useState<Especialidad | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        codigoEspecialidad: '',
        nombreEspecialidad: '',
        descripcion: '',
    });

    const handleAdd = () => {
        setEditingEspecialidad(null);
        // Sugerencia de código, pero editable
        setFormData({
            codigoEspecialidad: `ESP-${(initialData.length + 1).toString().padStart(3, '0')}`,
            nombreEspecialidad: '',
            descripcion: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (esp: Especialidad) => {
        setEditingEspecialidad(esp);
        setFormData({
            codigoEspecialidad: esp.codigoEspecialidad,
            nombreEspecialidad: esp.nombreEspecialidad,
            descripcion: esp.descripcion,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta especialidad?')) {
            const res = await deleteEspecialidad(codigo);
            if (res.success) {
                toast.success(res.message);
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
            let res;
            if (editingEspecialidad) {
                res = await updateEspecialidad(editingEspecialidad.codigoEspecialidad, formData);
            } else {
                res = await createEspecialidad(formData);
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

    const columns: Column<Especialidad>[] = [
        {
            key: 'codigoEspecialidad',
            label: 'Código',
            sortable: true,
            render: (e) => (
                <span className="font-mono text-blue-600 font-medium">{e.codigoEspecialidad}</span>
            )
        },
        {
            key: 'nombreEspecialidad',
            label: 'Nombre',
            sortable: true,
            render: (e) => (
                <span className="font-semibold text-gray-800">{e.nombreEspecialidad}</span>
            )
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            render: (e) => (
                <p className="max-w-md truncate text-gray-500 text-sm" title={e.descripcion}>
                    {e.descripcion}
                </p>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (e) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(e)}>
                        <Edit className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(e.codigoEspecialidad)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Especialidades</h1>
                    <p className="text-gray-600">Catálogo maestro de especialidades para la atención médica.</p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar especialidad..."
                    onAdd={handleAdd}
                    addLabel="Agregar Especialidad"
                    onExport={(format) => toast.info(`Exportando en formato ${format.toUpperCase()}...`)}
                />

                {/* Modal Formulario */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                                {editingEspecialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles de la especialidad médica para el catálogo.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo" className="flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-gray-400" />
                                            Código de Especialidad *
                                        </Label>
                                        <Input
                                            id="codigo"
                                            value={formData.codigoEspecialidad}
                                            onChange={(e) => setFormData({ ...formData, codigoEspecialidad: e.target.value })}
                                            required
                                            disabled={!!editingEspecialidad}
                                            placeholder="Ej. ESP-001"
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all uppercase"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            Nombre de la Especialidad *
                                        </Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombreEspecialidad}
                                            onChange={(e) => setFormData({ ...formData, nombreEspecialidad: e.target.value })}
                                            required
                                            placeholder="Ej. Medicina Interna"
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all text-lg font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="descripcion" className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            Descripción
                                        </Label>
                                        <Textarea
                                            id="descripcion"
                                            value={formData.descripcion}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                                            placeholder="Describa brevemente el alcance de esta especialidad..."
                                            className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all py-3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 border-gray-200 hover:bg-gray-50"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 font-semibold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingEspecialidad ? 'Guardar Cambios' : 'Registrar Especialidad')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
