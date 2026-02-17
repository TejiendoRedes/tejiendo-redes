'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Heart, MapPin, History } from 'lucide-react';
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
import { getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
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

    // Función para obtener nombres de ubicación
    const getLocationNames = (paciente: PacienteWithComunidad) => {
        const estado = (paciente as any).estado;
        const municipio = (paciente as any).municipio;
        const parroquia = (paciente as any).parroquia;

        if (!estado || !municipio || !parroquia) return '-';

        const estadoNombre = getEstadoNombre(estado);
        const municipioNombre = getMunicipioNombre(estado, municipio);
        const parroquiaNombre = getParroquiaNombre(estado, municipio, parroquia);

        if (parroquia) {
            return `${estadoNombre}, ${municipioNombre}, ${parroquiaNombre}`;
        }
        return `${estadoNombre}, ${municipioNombre}`;
    };

    const columns: Column<PacienteWithComunidad>[] = [
        {
            key: 'cedulaPaciente',
            label: 'Cédula',
            sortable: true,
        },
        {
            key: 'nombrePaciente',
            label: 'Nombre completo',
            render: (p) => `${p.nombrePaciente} ${p.apellidoPaciente}`,
            sortable: true,
        },
        {
            key: 'fechaNacimiento',
            label: 'Edad',
            render: (p) => `${calcularEdad(p.fechaNacimiento)} años`,
            sortable: true,
        },
        {
            key: 'sexo',
            label: 'Sexo',
            render: (p) => (
                <Badge variant="outline">
                    {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A'}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'comunidad',
            label: 'Comunidad',
            render: (p) => p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
            sortable: true,
        },
        {
            key: 'ubicacion',
            label: 'Ubicación',
            render: (p) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{getLocationNames(p)}</span>
                </div>
            ),
        },
        {
            key: 'telefonoPaciente',
            label: 'Teléfono',
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (p) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/datos-basicos/pacientes/${p.cedulaPaciente}`)}
                            title="Ver Historial"
                            aria-label="Ver historial del paciente"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <History className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            title="Editar"
                            aria-label="Editar paciente"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(p.cedulaPaciente)}
                            title="Eliminar"
                            aria-label="Eliminar paciente"
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(p => ({
            cedula: p.cedulaPaciente,
            nombre: `${p.nombrePaciente} ${p.apellidoPaciente}`,
            edad: `${calcularEdad(p.fechaNacimiento)} años`,
            sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A',
            comunidad: p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
            ubicacion: getLocationNames(p),
            telefono: p.telefonoPaciente || '-',
        }));

        const headers = ['cedula', 'nombre', 'edad', 'sexo', 'comunidad', 'ubicacion', 'telefono'];
        const columnsData = [
            { header: 'Cédula', dataKey: 'cedula' as const },
            { header: 'Nombre', dataKey: 'nombre' as const },
            { header: 'Edad', dataKey: 'edad' as const },
            { header: 'Sexo', dataKey: 'sexo' as const },
            { header: 'Comunidad', dataKey: 'comunidad' as const },
            { header: 'Ubicación', dataKey: 'ubicacion' as const },
            { header: 'Teléfono', dataKey: 'telefono' as const },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, columnsData, 'pacientes'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'pacientes', 'Reporte de Pacientes'));
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Pacientes</h1>
                    <p className="text-muted-foreground">
                        Gestión del registro de pacientes del sistema
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula, nombre, teléfono..."
                    onAdd={handleAdd}
                    addLabel="Agregar Paciente"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Heart className="w-6 h-6 text-primary" />
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

                <ConfirmDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                    title="Eliminar paciente"
                    description="¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar"
                    onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                />
            </div>
        </MainLayout>
    );
}
