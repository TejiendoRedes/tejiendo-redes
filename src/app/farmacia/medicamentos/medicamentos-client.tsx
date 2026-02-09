'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertCircle, Plus, Package } from 'lucide-react';
import { Medicamento } from '@/db/schema/medicamentos';
import { createMedicamento, deleteMedicamento, updateMedicamento, getMedicamentosEntregados } from '@/actions/medicamentos-actions';
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
import { useRouter } from 'next/navigation';

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

    const [formData, setFormData] = React.useState({
        codigoMedicamento: '',
        nombreMedicamento: '',
        presentacion: '',
        descripcion: '',
        existencia: 0,
    });

    const handleAdd = () => {
        setEditingMedicamento(null);
        setFormData({
            codigoMedicamento: '',
            nombreMedicamento: '',
            presentacion: '',
            descripcion: '',
            existencia: 0,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (med: Medicamento) => {
        setEditingMedicamento(med);
        setFormData({ ...med });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let res;
            if (editingMedicamento) {
                // Ensure codigo is consistent
                res = await updateMedicamento(editingMedicamento.codigoMedicamento, formData);
            } else {
                res = await createMedicamento(formData);
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

    const getStockBadge = (existencia: number) => {
        if (existencia === 0) {
            return <Badge variant="destructive" className="bg-red-600">Sin Stock</Badge>;
        } else if (existencia < 20) {
            return <Badge variant="destructive" className="bg-orange-500 border-orange-600">Stock Bajo</Badge>;
        } else if (existencia < 50) {
            return <Badge className="bg-yellow-500 text-yellow-950">Stock Medio</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Stock Bueno</Badge>;
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
            label: 'Stock',
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
            key: 'estado_stock', // Clave virtual
            label: 'Estado',
            render: (med) => getStockBadge(med.existencia),
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
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(med.codigoMedicamento)}
                        className="hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

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
                                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Stock Crítico / Agotado</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600 mb-1">Stock Bajo / Medio</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Stock Óptimo</p>
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
                    onExport={(format) => toast.info(`Exportando inventario en ${format.toUpperCase()}...`)}
                />

                {/* Modal Formulario con diseño mejorado */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                                {editingMedicamento ? (
                                    <><Edit className="w-6 h-6 text-blue-600" /> Editar Medicamento</>
                                ) : (
                                    <><Plus className="w-6 h-6 text-blue-600" /> Nuevo Medicamento</>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo" className="text-sm font-semibold text-gray-700">Código del Medicamento *</Label>
                                    <Input
                                        id="codigo"
                                        placeholder="Ej: MED-001"
                                        value={formData.codigoMedicamento}
                                        onChange={(e) =>
                                            setFormData({ ...formData, codigoMedicamento: e.target.value.toUpperCase() })
                                        }
                                        required
                                        disabled={!!editingMedicamento}
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <p className="text-[10px] text-gray-400">Identificador único del fármaco en el inventario.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombre Completo *</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="Ej: Paracetamol 500mg"
                                        value={formData.nombreMedicamento}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nombreMedicamento: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="presentacion" className="text-sm font-semibold text-gray-700">Presentación *</Label>
                                    <Input
                                        id="presentacion"
                                        placeholder="Ej: Tabletas, Jarabe, Ampollas..."
                                        value={formData.presentacion}
                                        onChange={(e) =>
                                            setFormData({ ...formData, presentacion: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="existencia" className="text-sm font-semibold text-gray-700">Cantidad en Stock (Existencia) *</Label>
                                    <Input
                                        id="existencia"
                                        type="number"
                                        min="0"
                                        value={formData.existencia}
                                        onChange={(e) =>
                                            setFormData({ ...formData, existencia: parseInt(e.target.value) || 0 })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">Descripción / Observaciones</Label>
                                    <Textarea
                                        id="descripcion"
                                        placeholder="Información adicional sobre el medicamento..."
                                        value={formData.descripcion}
                                        onChange={(e) =>
                                            setFormData({ ...formData, descripcion: e.target.value })
                                        }
                                        className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 h-11 text-gray-600 hover:bg-gray-100"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingMedicamento ? 'Actualizar' : 'Guardar Producto')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
