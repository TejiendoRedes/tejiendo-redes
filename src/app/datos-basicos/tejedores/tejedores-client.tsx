'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Users } from 'lucide-react';
import { Tejedor } from '@/db/schema/tejedores';
import { createTejedor, deleteTejedor, updateTejedor } from '@/actions/tejedores-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TejedorForm } from '@/components/forms/TejedorForm';

interface TejedoresClientProps {
    initialData: Tejedor[];
}

export default function TejedoresClient({ initialData }: TejedoresClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTejedor, setEditingTejedor] = React.useState<Tejedor | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAdd = () => {
        setEditingTejedor(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tejedor: Tejedor) => {
        setEditingTejedor(tejedor);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar este tejedor?')) {
            const res = await deleteTejedor(cedula);
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
            if (editingTejedor) {
                res = await updateTejedor(editingTejedor.cedulaTejedor, data);
            } else {
                res = await createTejedor(data);
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

    const columns: Column<Tejedor>[] = [
        {
            key: 'cedulaTejedor',
            label: 'Cédula',
            sortable: true,
        },
        {
            key: 'nombreTejedor',
            label: 'Nombre completo',
            render: (t) => `${t.nombreTejedor} ${t.apellidoTejedor}`,
            sortable: true,
        },
        {
            key: 'profesionTejedor',
            label: 'Profesión',
            sortable: true,
        },
        {
            key: 'tipodeVoluntario',
            label: 'Tipo Voluntario',
            sortable: true,
        },
        {
            key: 'telefonoTejedor',
            label: 'Teléfono',
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (t) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => toast.info('Detalle de tejedor en construcción')}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(t)}
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t.cedulaTejedor)}
                        title="Eliminar"
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Tejedores</h1>
                    <p className="text-gray-600">
                        Gestión del personal y colaboradores (tejedores)
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula, nombre, profesión..."
                    onAdd={handleAdd}
                    addLabel="Agregar Tejedor"
                    onExport={(format) => toast.info(`Exportando ${format.toUpperCase()}...`)}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-600" />
                                {editingTejedor ? 'Editar Tejedor' : 'Nuevo Tejedor'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información del tejedor.
                            </DialogDescription>
                        </DialogHeader>

                        <TejedorForm
                            initialData={editingTejedor || undefined}
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
