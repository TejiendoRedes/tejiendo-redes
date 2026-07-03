'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GraduationCap, FileText, Hash, Download, Activity } from 'lucide-react';
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

interface EspecialidadesClientProps {
    initialData: Especialidad[];
    isAdmin?: boolean;
}

export default function EspecialidadesClient({ initialData, isAdmin = false }: EspecialidadesClientProps) {
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
        setFormData({
            codigoEspecialidad: '',
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
            header: 'Código',
            className: 'w-[1%] whitespace-nowrap font-mono text-[#1e3a8a] font-medium',
        },
        {
            key: 'nombreEspecialidad',
            header: 'Nombre',
            className: 'font-semibold text-gray-900',
        },
        {
            key: 'descripcion',
            header: 'Descripción',
            render: (e) => (
                <p className="max-w-md truncate text-gray-500 text-sm" title={e.descripcion}>
                    {e.descripcion}
                </p>
            )
        },
        ...(isAdmin ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (e: any) => (
                <div className="flex gap-2 justify-end">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(e)}
                        title="Editar"
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(e.codigoEspecialidad)}
                        title="Eliminar"
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500 h-8 w-8 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : []),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(e => ({
            codigo: e.codigoEspecialidad,
            nombre: e.nombreEspecialidad,
            descripcion: e.descripcion,
        }));

        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Descripción', dataKey: 'descripcion' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'especialidades'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'especialidades', 'Reporte de Especialidades'));
        }
    };

    return (
        <MainLayout>
            <PageShell 
                title="Especialidades" 
                subtitle="Catálogo maestro de especialidades médicas"
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
                        {isAdmin && (
                            <Button 
                                onClick={handleAdd} 
                                className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                            >
                                <Award className="w-4 h-4 mr-2" />
                                Agregar Especialidad
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Especialidades</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de especialidades"
                    description="Busca por nombre o código de la especialidad"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreEspecialidad', 'codigoEspecialidad']}
                    searchPlaceholder="Buscar especialidad..."
                />

                {/* Modal Formulario */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-[#1e3a8a]" />
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
                                        <Label htmlFor="codigo" className="flex items-center gap-2 text-gray-700">
                                            <Hash className="w-4 h-4 text-gray-400" />
                                            Código de Especialidad *
                                        </Label>
                                        <Input
                                            id="codigo"
                                            value={formData.codigoEspecialidad}
                                            onChange={(e) => setFormData({ ...formData, codigoEspecialidad: e.target.value })}
                                            required={!!editingEspecialidad}
                                            disabled={true}
                                            placeholder={editingEspecialidad ? "" : "Automático (ESP-XXX)"}
                                            className="h-11 border-gray-200 bg-gray-50 text-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-all uppercase"
                                        />
                                        {!editingEspecialidad && (
                                            <p className="text-[11px] text-blue-600 font-medium mt-1 bg-blue-50 p-2 rounded-md">
                                                El sistema asignará el código automáticamente al guardar.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="flex items-center gap-2 text-gray-700">
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            Nombre de la Especialidad *
                                        </Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombreEspecialidad}
                                            onChange={(e) => setFormData({ ...formData, nombreEspecialidad: e.target.value })}
                                            required
                                            maxLength={50}
                                            placeholder="Ej. Medicina Interna"
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="descripcion" className="flex items-center gap-2 text-gray-700">
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

                            <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 border-gray-200 hover:bg-gray-50 text-gray-600"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-[#1e3a8a] hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingEspecialidad ? 'Guardar Cambios' : 'Registrar Especialidad')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout>
    );
}
