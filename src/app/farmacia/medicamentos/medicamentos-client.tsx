'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertCircle, Plus, Package, Pill } from 'lucide-react';
import { Medicamento } from '@/db/schema/medicamentos';
import { createMedicamento, deleteMedicamento, updateMedicamento, getMedicamentosEntregados } from '@/actions/medicamentos-actions';
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
}

export default function MedicamentosClient({ initialData }: MedicamentosClientProps) {
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
            label: 'Código',
            sortable: true,
        },
        {
            key: 'nombreMedicamento',
            label: 'Nombre',
            sortable: true,
            render: (med) => (
                <div className="font-medium text-gray-900">{med.nombreMedicamento}</div>
            )
        },
        {
            key: 'presentacion',
            label: 'Presentación',
            sortable: true,
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            render: (med) => (
                <p className="max-w-xs truncate text-gray-500" title={med.descripcion}>
                    {med.descripcion || '-'}
                </p>
            )
        },
        {
            key: 'existencia',
            label: 'Existencia',
            render: (med) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                        {med.existencia}
                    </span>
                    {med.existencia < 20 && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
            ),
            sortable: true,
        },
        {
            key: 'estado_existencia', // Clave virtual
            label: 'Estado',
            render: (med) => getExistenciaBadge(med.existencia),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (med) => (
                <div className="flex gap-1 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(med)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(med.codigoMedicamento)}
                        className="hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(m => ({
            codigo: m.codigoMedicamento,
            nombre: m.nombreMedicamento,
            presentacion: m.presentacion,
            existencia: m.existencia,
            descripcion: m.descripcion || '-',
        }));

        const headers = ['codigo', 'nombre', 'presentacion', 'existencia', 'descripcion'];
        const columnsData = [
            { header: 'Código', dataKey: 'codigo' },
            { header: 'Nombre', dataKey: 'nombre' },
            { header: 'Presentación', dataKey: 'presentacion' },
            { header: 'Existencia', dataKey: 'existencia' },
            { header: 'Descripción', dataKey: 'descripcion' },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, headers, 'inventario-medicamentos'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'inventario-medicamentos', 'Reporte de Inventario de Medicamentos'));
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Package className="w-8 h-8 text-blue-600" />
                            Medicamentos
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gestión integral del inventario de medicamentos y suministros.
                        </p>
                    </div>
                </div>

                {/* Resumen de alertas con diseño premium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border-l-4 border-l-red-500 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Existencia Crítica / Agotada</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia < 20).length}
                                </p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-l-4 border-l-yellow-500 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600 mb-1">Existencia Baja / Media</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia >= 20 && m.existencia < 50).length}
                                </p>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-l-4 border-l-green-500 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Existencia Óptima</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter((m) => m.existencia >= 50).length}
                                </p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de Medicamentos Solicitados */}
                {solicitudesData && (
                    <div className="bg-white border-l-4 border-l-blue-500 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Medicamentos Solicitados</p>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {solicitudesData.totales.totalUnidades.toLocaleString('es-VE')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {solicitudesData.totales.totalMedicamentos} tipos de medicamentos
                                    </p>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                )}

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por código, nombre o presentación..."
                    onAdd={handleAdd}
                    addLabel="Agregar Medicamento"
                    onExport={handleExport}
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
            </div>
        </MainLayout>
    );
}
