'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertCircle, Plus, Package, Pill } from 'lucide-react';
import { Medicamento } from '@/db/schema/medicamentos';
import { createMedicamento, deleteMedicamento, updateMedicamento } from '@/actions/medicamentos-actions';
import { getMedicamentosEntregados } from '@/queries/medicamentos';;
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MedicamentoForm } from '@/components/forms/MedicamentoForm';

interface MedicamentosClientProps {
    initialData: Medicamento[];
    canEdit?: boolean;
}

export default function MedicamentosClient({ initialData, canEdit = false }: MedicamentosClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingMedicamento, setEditingMedicamento] = React.useState<Medicamento | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [solicitudesData, setSolicitudesData] = React.useState<any>(null);

    // Cargar datos de solicitudes al montar el componente
    useEffect(() => {
        const loadSolicitudes = async () => {
            const result = await getMedicamentosEntregados();
            if (result.success) {
                setSolicitudesData(result.data);
            }
        };
        loadSolicitudes();
    }, []);

    const handleAdd = () => {
        setEditingMedicamento(null);
        setIsModalOpen(true);
    };

    const handleEdit = (med: Medicamento) => {
        setEditingMedicamento(med);
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar este medicamento?')) {
            const res = await deleteMedicamento(codigo);
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
            if (editingMedicamento) {
                res = await updateMedicamento(editingMedicamento.codigoMedicamento, data);
            } else {
                res = await createMedicamento(data);
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

    const getExistenciaBadge = (existencia: number) => {
        if (existencia === 0) {
            return <Badge variant="destructive" className="bg-red-600">Sin Existencia</Badge>;
        } else if (existencia < 20) {
            return <Badge variant="destructive" className="bg-orange-500 border-orange-600">Existencia Baja</Badge>;
        } else if (existencia < 50) {
            return <Badge className="bg-yellow-500 text-yellow-950">Existencia Media</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Existencia Buena</Badge>;
        }
    };

    const columns: Column<Medicamento>[] = [
        {
            key: 'codigoMedicamento',
            header: 'Código',
            render: (med) => <span className="font-medium text-gray-900">{med.codigoMedicamento}</span>
        },
        {
            key: 'nombreMedicamento',
            header: 'Nombre',
            render: (med) => (
                <div className="font-medium text-gray-900">{med.nombreMedicamento}</div>
            )
        },
        {
            key: 'presentacion',
            header: 'Presentación',
            render: (med) => med.presentacion
        },
        {
            key: 'descripcion',
            header: 'Descripción',
            render: (med) => (
                <p className="max-w-xs truncate text-gray-500" title={med.descripcion}>
                    {med.descripcion || '-'}
                </p>
            )
        },
        {
            key: 'precio',
            header: 'Precio',
            render: (med) => (
                <span className="font-medium text-gray-900">
                    {Number(med.precio ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'existencia',
            header: 'Existencia',
            render: (med) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                        {med.existencia}
                    </span>
                    {med.existencia < 20 && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
            )
        },
        {
            key: 'estado_existencia', // Clave virtual
            header: 'Estado',
            render: (med) => getExistenciaBadge(med.existencia),
        },
        ...(canEdit ? [{
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (med: any) => (
                <div className="flex gap-1 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(med)}
                        className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(med.codigoMedicamento)}
                        className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        }] : []),
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(m => ({
            codigo: m.codigoMedicamento,
            nombre: m.nombreMedicamento,
            presentacion: m.presentacion,
            precio: m.precio,
            existencia: m.existencia,
            descripcion: m.descripcion || '-',
        }));

        const headers = ['codigo', 'nombre', 'presentacion', 'precio', 'existencia', 'descripcion'];
        const columnsData = [
            { header: 'Código', dataKey: 'codigo' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Presentación', dataKey: 'presentacion' as const },
            { header: 'Precio', dataKey: 'precio' as const },
            { header: 'Existencia', dataKey: 'existencia' as const },
            { header: 'Descripción', dataKey: 'descripcion' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'inventario-medicamentos'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'inventario-medicamentos', 'Reporte de Inventario de Medicamentos'));
        }
    };

    return (
        <MainLayout>
            <PageShell 
                title="Inventario de Medicamentos" 
                subtitle="Gestión integral de existencias e insumos médicos"
                actions={
                    canEdit && (
                        <Button
                            onClick={handleAdd}
                            className="bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-sm shadow-[#1e3a8a]/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Medicamento
                        </Button>
                    )
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Alerta Roja */}
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Agotados / Crítico</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia < 20).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Alerta Amarilla */}
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Existencia Baja</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia >= 20 && m.existencia < 50).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Alerta Verde */}
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Existencia Óptima</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia >= 50).length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Solicitudes */}
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entregados</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {solicitudesData ? solicitudesData.totales.totalUnidades.toLocaleString('es-VE') : '0'}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        {solicitudesData && (
                            <p className="text-xs text-gray-500 mt-2 truncate">
                                {solicitudesData.totales.totalMedicamentos} medicamentos distintos
                            </p>
                        )}
                    </div>
                </div>

                <DataTable
                    title="Listado de medicamentos"
                    description="Busca por código, nombre o presentación"
                    data={initialData}
                    columns={columns}
                    searchKeys={['codigoMedicamento', 'nombreMedicamento', 'presentacion']}
                    searchPlaceholder="Buscar por código, nombre o presentación..."
                    primaryAction={{
                        label: 'Agregar Medicamento',
                        onClick: handleAdd
                    }}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                                <Pill className="w-6 h-6 text-blue-600" />
                                {editingMedicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los datos del medicamento.
                            </DialogDescription>
                        </DialogHeader>

                        <MedicamentoForm
                            initialData={editingMedicamento || undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isLoading}
                        />
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout>
    );
}
