'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Heart, MapPin, Phone, Eye } from 'lucide-react';
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
import { StatusBadge } from '@/components/ui/StatusBadge';

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
            key: 'nombrePaciente',
            header: 'Paciente',
            render: (p) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-primary">
                        {p.nombrePaciente[0]}{p.apellidoPaciente[0]}
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">{p.nombrePaciente} {p.apellidoPaciente}</p>
                        <p className="text-xs text-muted-foreground">{p.cedulaPaciente}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'fechaNacimiento',
            header: 'Edad',
            render: (p) => `${calcularEdad(p.fechaNacimiento)} años`,
        },
        {
            key: 'sexo',
            header: 'Sexo',
            render: (p) => (p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'N/A'),
        },
        {
            key: 'telefonoPaciente',
            header: 'Teléfono',
            render: (p) => (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {p.telefonoPaciente || '-'}
                </span>
            ),
        },
        {
            key: 'comunidad',
            header: 'Comunidad / Último abordaje',
            render: (p) => p.comunidad?.nombreComunidad || p.codigoComunidad || '-',
        },
        {
            key: 'ubicacion',
            header: 'Ubicación',
            render: (p) => (
                <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{getLocationNames(p)}</span>
                </div>
            ),
        },
        {
            key: 'acciones',
            header: '',
            className: 'text-right',
            render: (p) => {
                return (
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                            <Edit className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                            onClick={() => setDeleteTarget(p.cedulaPaciente)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 hover:border-destructive/40"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
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
            <PageShell title="Pacientes" subtitle="Registro de personas atendidas en jornadas comunitarias">
                <DataTable
                    title="Listado de pacientes"
                    description="Busca por nombre, cédula o teléfono"
                    data={initialData}
                    columns={columns}
                    searchKeys={['nombrePaciente', 'apellidoPaciente', 'cedulaPaciente', 'telefonoPaciente']}
                    searchPlaceholder="Buscar por cédula, nombre, teléfono..."
                    primaryAction={{ label: 'Nuevo Paciente', onClick: handleAdd }}
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
            </PageShell>
        </MainLayout>
    );
}
