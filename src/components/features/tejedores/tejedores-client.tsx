'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Phone, Eye, Download, Plus, Stethoscope, HeartHandshake } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface TejedorWithGeo extends Tejedor {
    estadoNombre?: string | null;
    municipioNombre?: string | null;
    parroquiaNombre?: string | null;
    estadoId?: number | null;
    municipioId?: number | null;
}

interface TejedoresClientProps {
    initialData: (TejedorWithGeo & { systemRole?: string | null })[];
    especialidades?: any[];
    isAdmin?: boolean;
}

export default function TejedoresClient({ initialData, especialidades = [], isAdmin = false }: TejedoresClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewingTejedor, setViewingTejedor] = React.useState<TejedorWithGeo | null>(null);
    const [editingTejedor, setEditingTejedor] = React.useState<TejedorWithGeo | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

    const calcularEdad = (fecha: string | Date | null) => {
        if (!fecha) return 0;
        const hoy = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const getLocationNames = (t: TejedorWithGeo) => {
        if (!t.estadoNombre || !t.municipioNombre) return '-';
        if (t.parroquiaNombre) {
            return `${t.estadoNombre}, ${t.municipioNombre}, ${t.parroquiaNombre}`;
        }
        return `${t.estadoNombre}, ${t.municipioNombre}`;
    };

    const handleAdd = () => {
        setEditingTejedor(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tejedor: TejedorWithGeo) => {
        setEditingTejedor(tejedor);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        const res = await deleteTejedor(cedula);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
        } else {
            toast.error(res.error);
        }
        setDeleteTarget(null);
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

    const columns: Column<TejedorWithGeo>[] = [
        {
            key: 'nombreTejedor',
            header: 'Tejedor',
            render: (t) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a]/10 text-sm font-bold text-[#1e3a8a]">
                        {t.nombreTejedor[0]}{t.apellidoTejedor[0]}
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">{t.nombreTejedor} {t.apellidoTejedor}</p>
                        <p className="text-xs text-muted-foreground">{t.cedulaTejedor}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'profesionTejedor',
            header: 'Profesión',
            render: (t) => t.profesionTejedor || '-',
        },
        {
            key: 'tipodeVoluntario',
            header: 'Tipo Voluntario',
            render: (t) => t.tipodeVoluntario || '-',
        },
        {
            key: 'telefonoTejedor',
            header: 'Teléfono',
            render: (t) => (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {t.telefonoTejedor || '-'}
                </span>
            ),
        },
        {
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (t) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingTejedor(t)}
                        className="hover:bg-blue-50 hover:text-[#1e3a8a] text-gray-500"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(t)}
                                className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(t.cedulaTejedor)}
                                className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(t => ({
            cedula: t.cedulaTejedor,
            nombre: `${t.nombreTejedor} ${t.apellidoTejedor}`,
            profesion: t.profesionTejedor,
            tipo: t.tipodeVoluntario,
            telefono: t.telefonoTejedor,
        }));

        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Profesión', dataKey: 'profesion' as const },
            { header: 'Tipo Voluntario', dataKey: 'tipo' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'tejedores'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'tejedores', 'Reporte de Tejedores'));
        }
    };

    return (
        <MainLayout>
            <PageShell 
                title="Tejedores" 
                subtitle="Gestión de médicos, estudiantes y voluntarios"
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
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Tejedor
                            </Button>
                        )}
                    </div>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Redes</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a] transition-colors group-hover:bg-[#1e3a8a]/10">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Médicos</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(t => t.tipodeVoluntario?.toLowerCase().includes('médico') || t.profesionTejedor?.toLowerCase().includes('médico')).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Voluntarios Generales</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(t => !t.tipodeVoluntario?.toLowerCase().includes('médico') && !t.profesionTejedor?.toLowerCase().includes('médico')).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                                <HeartHandshake className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de tejedores"
                    description="Busca por nombre, cédula, profesión o teléfono"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombreTejedor', 'apellidoTejedor', 'cedulaTejedor', 'profesionTejedor', 'telefonoTejedor']}
                    searchPlaceholder="Buscar por cédula, nombre, profesión, teléfono..."
                    filters={[
                        {
                            key: 'tipodeVoluntario',
                            label: 'Tipo de Voluntario',
                            options: [
                                { label: 'Médico', value: 'Médico' },
                                { label: 'Estudiante', value: 'Estudiante' },
                                { label: 'Colaborador', value: 'Colaborador' },
                                { label: 'Voluntario General', value: 'Voluntario General' }
                            ]
                        }
                    ]}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                {editingTejedor ? 'Editar Tejedor' : 'Nuevo Tejedor'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información del tejedor.
                            </DialogDescription>
                        </DialogHeader>

                        <TejedorForm
                            key={editingTejedor ? editingTejedor.cedulaTejedor : 'new'}
                            initialData={editingTejedor || undefined}
                            especialidades={especialidades}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingTejedor} onOpenChange={(open) => !open && setViewingTejedor(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#1e3a8a]">
                                Detalles del Tejedor
                            </DialogTitle>
                            <DialogDescription className="hidden">Ver detalles completos del tejedor</DialogDescription>
                        </DialogHeader>
                        {viewingTejedor && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-xl font-bold text-[#1e3a8a]">
                                        {viewingTejedor.nombreTejedor[0]}{viewingTejedor.apellidoTejedor[0]}
                                    </span>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{viewingTejedor.nombreTejedor} {viewingTejedor.apellidoTejedor}</p>
                                        <p className="text-sm text-gray-500">C.I. {viewingTejedor.cedulaTejedor}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Edad</p>
                                        <p className="font-medium">{calcularEdad(viewingTejedor.fechaNacimiento)} años</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Profesión / Tipo</p>
                                        <p className="font-medium">{viewingTejedor.profesionTejedor} / {viewingTejedor.tipodeVoluntario}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Teléfono</p>
                                        <p className="font-medium">{viewingTejedor.telefonoTejedor || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Correo</p>
                                        <p className="font-medium">{viewingTejedor.correoTejedor || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Fecha de Ingreso</p>
                                        <p className="font-medium">{new Date(viewingTejedor.fechaIngreso).toLocaleDateString('es-VE')}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Ubicación</p>
                                        <p className="font-medium">{getLocationNames(viewingTejedor)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Dirección Detallada</p>
                                        <p className="font-medium">{viewingTejedor.direccionTejedor}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button onClick={() => setViewingTejedor(null)} variant="outline">
                                        Cerrar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                    title="Eliminar tejedor"
                    description="¿Está seguro de eliminar este tejedor? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                />
            </PageShell>
        </MainLayout>
    );
}

