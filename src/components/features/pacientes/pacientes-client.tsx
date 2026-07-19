'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Heart, Plus, Users } from 'lucide-react';
import { Paciente } from '@/db/schema/pacientes';
import { Comunidad } from '@/db/schema/comunidades';
import { createPaciente, deletePaciente, updatePaciente } from '@/actions/pacientes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PacienteForm } from '@/components/forms/PacienteForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface PacienteWithComunidad extends Paciente {
    comunidad: Comunidad | null;
}

interface PacientesClientProps {
    initialData: PacienteWithComunidad[];
    comunidades: Comunidad[];
}

export default function PacientesClient({ initialData, comunidades }: PacientesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewingPaciente, setViewingPaciente] = React.useState<PacienteWithComunidad | null>(null);
    const [editingPaciente, setEditingPaciente] = React.useState<PacienteWithComunidad | null>(null);
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

    const handleAdd = () => {
        setEditingPaciente(null);
        setIsModalOpen(true);
    };

    const handleEdit = (paciente: PacienteWithComunidad) => {
        setEditingPaciente(paciente);
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        const res = await deletePaciente(cedula);
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
            if (editingPaciente) {
                res = await updatePaciente(editingPaciente.cedulaPaciente, data);
            } else {
                res = await createPaciente(data);
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

    const columns: Column<PacienteWithComunidad>[] = [
        {
            key: 'cedulaPaciente',
            header: 'Cédula',
        },
        {
            key: 'nombrePaciente',
            header: 'Nombre completo',
            render: (p) => `${p.nombrePaciente} ${p.apellidoPaciente}`,
        },
        {
            key: 'fechaNacimiento',
            header: 'Edad',
            render: (p) => `${calcularEdad(p.fechaNacimiento)} años`,
        },
        {
            key: 'sexo',
            header: 'Sexo',
            render: (p) => (
                <Badge variant="outline">
                    {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A'}
                </Badge>
            ),
        },
        {
            key: 'comunidad',
            header: 'Comunidad',
            render: (p) => p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
        },
        {
            key: 'telefonoPaciente',
            header: 'Teléfono',
        },
        {
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (p) => {
                return (
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingPaciente(p)}
                            className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                            title="Ver detalles"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            className="hover:bg-blue-50 hover:text-blue-600 text-gray-500"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p.cedulaPaciente)}
                            className="hover:bg-red-50 hover:text-red-600 text-gray-500"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <MainLayout>
            <PageShell 
                title="Pacientes" 
                subtitle="Gestión del registro de pacientes del sistema"
                actions={
                    <Button 
                        onClick={handleAdd} 
                        className="bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Paciente
                    </Button>
                }
            >
                {/* Métricas Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Pacientes</p>
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hombres</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(p => p.sexo === 'M').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mujeres</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {initialData.filter(p => p.sexo === 'F').length}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-100">
                                <Heart className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Listado de pacientes"
                    description="Busca por nombre, cédula o teléfono"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombrePaciente', 'apellidoPaciente', 'cedulaPaciente', 'telefonoPaciente']}
                    searchPlaceholder="Buscar por cédula, nombre, teléfono..."
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Heart className="w-6 h-6 text-[#1e3a8a]" />
                                {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información del paciente.
                            </DialogDescription>
                        </DialogHeader>

                        <PacienteForm
                            initialData={editingPaciente || undefined}
                            comunidades={comunidades}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={isLoading}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={!!viewingPaciente} onOpenChange={(open) => !open && setViewingPaciente(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-blue-900">
                                Detalles del Paciente
                            </DialogTitle>
                            <DialogDescription className="hidden">Ver detalles completos del paciente</DialogDescription>
                        </DialogHeader>
                        {viewingPaciente && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-[#1e3a8a]">
                                        {viewingPaciente.nombrePaciente[0]}{viewingPaciente.apellidoPaciente[0]}
                                    </span>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{viewingPaciente.nombrePaciente} {viewingPaciente.apellidoPaciente}</p>
                                        <p className="text-sm text-gray-500">C.I. {viewingPaciente.cedulaPaciente}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Edad</p>
                                        <p className="font-medium">{calcularEdad(viewingPaciente.fechaNacimiento)} años</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Sexo</p>
                                        <p className="font-medium">{viewingPaciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Teléfono</p>
                                        <p className="font-medium">{viewingPaciente.telefonoPaciente || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-0.5">Correo</p>
                                        <p className="font-medium">{viewingPaciente.correoPaciente || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Comunidad</p>
                                        <p className="font-medium">{viewingPaciente.comunidad?.nombreComunidad || viewingPaciente.codigoComunidad || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 mb-0.5">Dirección Detallada</p>
                                        <p className="font-medium">{viewingPaciente.direccionPaciente}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button onClick={() => setViewingPaciente(null)} variant="outline">
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
                    title="Eliminar paciente"
                    description="¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                />
            </PageShell>
        </MainLayout>
    );
}
