'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserCheck, Mail, Phone, MapPin, Briefcase, User } from 'lucide-react';
import { Responsable } from '@/db/schema/responsable';
import { createResponsable, deleteResponsable, updateResponsable } from '@/actions/responsables-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ResponsablesClientProps {
    initialData: Responsable[];
}

export default function ResponsablesClient({ initialData }: ResponsablesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingResponsable, setEditingResponsable] = React.useState<Responsable | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        cedulaResponsable: '',
        nombreResponsable: '',
        apellidoResponsable: '',
        direccionResponsable: '',
        telefonoResponsable: '',
        correoResponsable: '',
        cargo: '',
    });

    const handleAdd = () => {
        setEditingResponsable(null);
        setFormData({
            cedulaResponsable: '',
            nombreResponsable: '',
            apellidoResponsable: '',
            direccionResponsable: '',
            telefonoResponsable: '',
            correoResponsable: '',
            cargo: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (r: Responsable) => {
        setEditingResponsable(r);
        setFormData({
            cedulaResponsable: r.cedulaResponsable,
            nombreResponsable: r.nombreResponsable,
            apellidoResponsable: r.apellidoResponsable,
            direccionResponsable: r.direccionResponsable,
            telefonoResponsable: r.telefonoResponsable,
            correoResponsable: r.correoResponsable,
            cargo: r.cargo,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar este responsable?')) {
            const res = await deleteResponsable(cedula);
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
            if (editingResponsable) {
                res = await updateResponsable(editingResponsable.cedulaResponsable, formData);
            } else {
                res = await createResponsable(formData);
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

    const columns: Column<Responsable>[] = [
        {
            key: 'cedulaResponsable',
            label: 'Cédula',
            sortable: true,
            render: (r) => <span className="font-medium text-gray-700">{r.cedulaResponsable}</span>
        },
        {
            key: 'nombreResponsable', // Virtual key sort requires implementation in DataTable but key is required
            label: 'Nombre Completo',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{r.nombreResponsable} {r.apellidoResponsable}</span>
                    <span className="text-xs text-gray-500">{r.correoResponsable}</span>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'cargo',
            label: 'Cargo',
            sortable: true,
            render: (r) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {r.cargo}
                </span>
            )
        },
        {
            key: 'direccionResponsable',
            label: 'Dirección',
            render: (r) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 max-w-xs truncate" title={r.direccionResponsable}>
                        {r.direccionResponsable}
                    </span>
                </div>
            ),
        },
        {
            key: 'telefonoResponsable',
            label: 'Teléfono',
            render: (r) => <span className="text-gray-600">{r.telefonoResponsable}</span>
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (r) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
                        <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.cedulaResponsable)}>
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Responsables</h1>
                        <p className="text-gray-600 font-medium">Gestión de líderes y responsables de comunidades.</p>
                    </div>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por nombre, cédula o cargo..."
                    onAdd={handleAdd}
                    addLabel="Agregar Responsable"
                    onExport={(format) => toast.info(`Exportando en formato ${format.toUpperCase()}...`)}
                />

                {/* Modal Formulario */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px] border-none shadow-2xl">
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <DialogTitle className="text-2xl flex items-center gap-3 text-gray-900">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                {editingResponsable ? 'Editar Responsable' : 'Nuevo Responsable'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 pt-1">
                                Ingrese los datos del responsable de comunidad. Todos los campos con * son obligatorios.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="cedula" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Cédula *
                                    </Label>
                                    <Input
                                        id="cedula"
                                        value={formData.cedulaResponsable}
                                        onChange={(e) => setFormData({ ...formData, cedulaResponsable: e.target.value })}
                                        required
                                        disabled={!!editingResponsable}
                                        placeholder="Ej. 12345678"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cargo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        Cargo *
                                    </Label>
                                    <Input
                                        id="cargo"
                                        value={formData.cargo}
                                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                        required
                                        placeholder="Ej. Presidente de JAC"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombres *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombreResponsable}
                                        onChange={(e) => setFormData({ ...formData, nombreResponsable: e.target.value })}
                                        required
                                        placeholder="Ej. María Josefa"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellido" className="text-sm font-semibold text-gray-700">Apellidos *</Label>
                                    <Input
                                        id="apellido"
                                        value={formData.apellidoResponsable}
                                        onChange={(e) => setFormData({ ...formData, apellidoResponsable: e.target.value })}
                                        required
                                        placeholder="Ej. Pérez García"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefono" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        Teléfono *
                                    </Label>
                                    <Input
                                        id="telefono"
                                        value={formData.telefonoResponsable}
                                        onChange={(e) => setFormData({ ...formData, telefonoResponsable: e.target.value })}
                                        required
                                        placeholder="Ej. 0424-1234567"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        Correo Electrónico *
                                    </Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={formData.correoResponsable}
                                        onChange={(e) => setFormData({ ...formData, correoResponsable: e.target.value })}
                                        required
                                        placeholder="correo@ejemplo.com"
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>

                                <div className="col-span-full space-y-2">
                                    <Label htmlFor="direccion" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        Dirección de Habitación *
                                    </Label>
                                    <Input
                                        id="direccion"
                                        value={formData.direccionResponsable}
                                        onChange={(e) => setFormData({ ...formData, direccionResponsable: e.target.value })}
                                        required
                                        placeholder="Ej. Calle Principal, Casa nro 123..."
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingResponsable ? 'Actualizar Datos' : 'Registrar Responsable')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
