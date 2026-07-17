'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Heart, UserPlus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

    const [formData, setFormData] = React.useState({
        cedulaPaciente: '',
        nombrePaciente: '',
        apellidoPaciente: '',
        sexo: 'M' as 'M' | 'F',
        fechaNacimiento: '',
        codigoComunidad: '',
        direccionPaciente: '',
        telefonoPaciente: '',
        correoPaciente: '',
        historialEnfermedades: '',
        consultasMedicasPrevias: '',
        nota: '',
    });

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
        setFormData({
            cedulaPaciente: '',
            nombrePaciente: '',
            apellidoPaciente: '',
            sexo: 'M',
            fechaNacimiento: '',
            codigoComunidad: '',
            direccionPaciente: '',
            telefonoPaciente: '',
            correoPaciente: '',
            historialEnfermedades: '',
            consultasMedicasPrevias: '',
            nota: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (paciente: PacienteWithComunidad) => {
        setEditingPaciente(paciente);
        setFormData({
            cedulaPaciente: paciente.cedulaPaciente,
            nombrePaciente: paciente.nombrePaciente,
            apellidoPaciente: paciente.apellidoPaciente,
            sexo: paciente.sexo as 'M' | 'F',
            fechaNacimiento: paciente.fechaNacimiento instanceof Date
                ? paciente.fechaNacimiento.toISOString().split('T')[0]
                : typeof paciente.fechaNacimiento === 'string' ? paciente.fechaNacimiento : '',
            codigoComunidad: paciente.codigoComunidad,
            direccionPaciente: paciente.direccionPaciente,
            telefonoPaciente: paciente.telefonoPaciente,
            correoPaciente: paciente.correoPaciente,
            historialEnfermedades: paciente.historialEnfermedades || '',
            consultasMedicasPrevias: paciente.consultasMedicasPrevias || '',
            nota: paciente.nota || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar este paciente?')) {
            const res = await deletePaciente(cedula);
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
            // Ensure date is purely YYYY-MM-DD for saving if needed, or Date object.
            // Server action expects Date or string? schema says date mode: 'date', so Date object or string usually works.
            // Drizzle 'date' mode usually expects Date object or YYYY-MM-DD string.
            const dataToSubmit = {
                ...formData,
                fechaNacimiento: new Date(formData.fechaNacimiento)
            };

            let res;
            if (editingPaciente) {
                res = await updatePaciente(editingPaciente.cedulaPaciente, dataToSubmit);
            } else {
                res = await createPaciente(dataToSubmit);
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
                            title="Ver detalles"
                            // onClick={() => router.push(`/datos-basicos/pacientes/${p.cedulaPaciente}`)} // Page details not implemented yet
                            onClick={() => toast.info('Detalle de paciente en construcción')}
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p)}
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.cedulaPaciente)}
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl text-gray-900 mb-2">Pacientes</h1>
                    <p className="text-gray-600">
                        Gestión del registro de pacientes del sistema
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula, nombre, teléfono..."
                    onAdd={handleAdd}
                    addLabel="Agregar Paciente"
                    onExport={(format) => toast.info(`Exportando ${format.toUpperCase()}...`)}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Heart className="w-6 h-6 text-blue-600" />
                                {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese la información del paciente.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cedula">Cédula *</Label>
                                    <Input
                                        id="cedula"
                                        value={formData.cedulaPaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, cedulaPaciente: e.target.value })
                                        }
                                        required
                                        disabled={!!editingPaciente}
                                        maxLength={12}
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombrePaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nombrePaciente: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input
                                        id="apellido"
                                        value={formData.apellidoPaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, apellidoPaciente: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sexo">Sexo *</Label>
                                    <Select
                                        value={formData.sexo}
                                        onValueChange={(value: 'M' | 'F') =>
                                            setFormData({ ...formData, sexo: value })
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Seleccione sexo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Masculino</SelectItem>
                                            <SelectItem value="F">Femenino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                                    <Input
                                        id="fechaNacimiento"
                                        type="date"
                                        value={formData.fechaNacimiento}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fechaNacimiento: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comunidad">Comunidad *</Label>
                                    <Select
                                        value={formData.codigoComunidad}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, codigoComunidad: value })
                                        }
                                    >
                                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Seleccione comunidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {comunidades.map((c) => (
                                                <SelectItem key={c.codigoComunidad} value={c.codigoComunidad}>
                                                    {c.nombreComunidad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        value={formData.telefonoPaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, telefonoPaciente: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correo">Correo Electrónico *</Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={formData.correoPaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, correoPaciente: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label htmlFor="direccion">Dirección *</Label>
                                    <Input
                                        id="direccion"
                                        value={formData.direccionPaciente}
                                        onChange={(e) =>
                                            setFormData({ ...formData, direccionPaciente: e.target.value })
                                        }
                                        required
                                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label htmlFor="historialEnfermedades">
                                        Historial de enfermedades
                                    </Label>

                                    <Textarea
                                        id="historialEnfermedades"
                                        value={formData.historialEnfermedades}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                historialEnfermedades: e.target.value
                                            })
                                        }
                                        rows={4}
                                        placeholder="Describa el historial de enfermedades del paciente..."
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label htmlFor="consultasMedicasPrevias">
                                        Consultas médicas previas
                                    </Label>

                                    <Textarea
                                        id="consultasMedicasPrevias"
                                        value={formData.consultasMedicasPrevias}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                consultasMedicasPrevias: e.target.value
                                            })
                                        }
                                        rows={4}
                                        placeholder="Describa las consultas médicas previas del paciente..."
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <Label htmlFor="nota">Notas / Observaciones</Label>
                                    <Textarea
                                        id="nota"
                                        value={formData.nota}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nota: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingPaciente ? 'Actualizar Paciente' : 'Guardar Paciente')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
