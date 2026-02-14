'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity } from 'lucide-react';

import type { Enfermedad, NewEnfermedad } from '@/db/schema/enfermedades';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createEnfermedad, updateEnfermedad, deleteEnfermedad } from '@/actions/enfermedades-actions';

interface EnfermedadesClientProps {
    initialData: Enfermedad[];
}

export default function EnfermedadesClient({ initialData }: EnfermedadesClientProps) {
    const [enfermedades, setEnfermedades] = React.useState<Enfermedad[]>(initialData);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEnfermedad, setEditingEnfermedad] = React.useState<Enfermedad | null>(null);

    const [formData, setFormData] = React.useState<NewEnfermedad>({
        codigoEnfermedad: '',
        nombreEnfermedad: '',
        tipoPatologia: '',
        descripcion: '',
    });

    const handleAdd = () => {
        setEditingEnfermedad(null);
        setFormData({
            codigoEnfermedad: '',
            nombreEnfermedad: '',
            tipoPatologia: '',
            descripcion: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (enfermedad: Enfermedad) => {
        setEditingEnfermedad(enfermedad);
        setFormData({
            codigoEnfermedad: enfermedad.codigoEnfermedad,
            nombreEnfermedad: enfermedad.nombreEnfermedad,
            tipoPatologia: enfermedad.tipoPatologia,
            descripcion: enfermedad.descripcion || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta enfermedad?')) {
            const res = await deleteEnfermedad(codigo);
            if (res.success) {
                setEnfermedades(prev => prev.filter(e => e.codigoEnfermedad !== codigo));
                toast.success('Enfermedad eliminada correctamente');
            } else {
                toast.error(res.error || 'Error al eliminar');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingEnfermedad) {
            const res = await updateEnfermedad(editingEnfermedad.codigoEnfermedad, formData);
            if (res.success) {
                // Optimistic update or refresh could happen here, but for simplicity we relies on revalidatePath
                // However, to update local state immediately without refresh:
                setEnfermedades(prev =>
                    prev.map(en =>
                        en.codigoEnfermedad === editingEnfermedad.codigoEnfermedad
                            ? { ...en, ...formData } as Enfermedad
                            : en
                    )
                );
                toast.success('Enfermedad actualizada correctamente');
                setIsModalOpen(false);
            } else {
                toast.error(res.error || 'Error al actualizar');
            }
        } else {
            const res = await createEnfermedad(formData);
            if (res.success) {
                setEnfermedades(prev => [...prev, formData as Enfermedad]);
                toast.success('Enfermedad creada correctamente');
                setIsModalOpen(false);
            } else {
                toast.error(res.error || 'Error al crear');
            }
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
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enfermedad.codigoEnfermedad)}
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Enfermedades</h1>
                    <p className="text-gray-600">
                        Catálogo de enfermedades para estandarizar diagnósticos
                    </p>
                </div>

                <DataTable
                    data={enfermedades}
                    columns={columns}
                    searchPlaceholder="Buscar por código, nombre o tipo..."
                    onAdd={handleAdd}
                    addLabel="Agregar Enfermedad"
                    onExport={(format) => toast.info(`Exportando ${format.toUpperCase()}...`)}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Activity className="w-6 h-6 text-blue-600" />
                                {editingEnfermedad ? 'Editar Enfermedad' : 'Nueva Enfermedad'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    placeholder={editingEnfermedad ? "" : "Automático (ENF-XXX)"}
                                    value={formData.codigoEnfermedad}
                                    onChange={(e) => setFormData({ ...formData, codigoEnfermedad: e.target.value })}
                                    required={!!editingEnfermedad}
                                    disabled={true}
                                    className="h-11 border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {!editingEnfermedad && (
                                    <p className="text-[10px] text-blue-600 font-medium font-sans">
                                        El sistema asignará el código de forma automática.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombreEnfermedad}
                                    onChange={(e) => setFormData({ ...formData, nombreEnfermedad: e.target.value })}
                                    required
                                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo Patología *</Label>
                                <Input
                                    id="tipo"
                                    placeholder="Ej: Respiratoria, Viral..."
                                    value={formData.tipoPatologia}
                                    onChange={(e) => setFormData({ ...formData, tipoPatologia: e.target.value })}
                                    required
                                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcion || ''}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
                                >
                                    Guardar Enfermedad
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
