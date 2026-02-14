'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Heart, UserPlus, MapPin } from 'lucide-react';
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
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio, getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';

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

    // Estados para selectores dependientes
    const estados = getEstados();
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    const [formData, setFormData] = React.useState({
        cedulaPaciente: '',
        nombrePaciente: '',
        apellidoPaciente: '',
        sexo: 'M' as 'M' | 'F',
        fechaNacimiento: '',
        codigoComunidad: '',
        estado: '',
        municipio: '',
        parroquia: '',
        direccionPaciente: '',
        telefonoPaciente: '',
        correoPaciente: '',
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
            estado: '',
            municipio: '',
            parroquia: '',
            direccionPaciente: '',
            telefonoPaciente: '',
            correoPaciente: '',
            nota: '',
        });
        // Resetear selectores dependientes
        setMunicipios([]);
        setParroquias([]);
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
            estado: (paciente as any).estado || '',
            municipio: (paciente as any).municipio || '',
            parroquia: (paciente as any).parroquia || '',
            direccionPaciente: paciente.direccionPaciente,
            telefonoPaciente: paciente.telefonoPaciente,
            correoPaciente: paciente.correoPaciente,
            nota: paciente.nota || '',
        });

        // Cargar municipios y parroquias para el estado y municipio seleccionados
        if ((paciente as any).estado) {
            setMunicipios(getMunicipiosByEstado((paciente as any).estado));
            if ((paciente as any).municipio) {
                setParroquias(getParroquiasByMunicipio((paciente as any).estado, (paciente as any).municipio));
            }
        }

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

    // Manejadores para selectores dependientes
    const handleEstadoChange = (estadoId: string) => {
        setFormData(prev => ({
            ...prev,
            estado: estadoId,
            municipio: '',
            parroquia: ''
        }));
        setMunicipios(getMunicipiosByEstado(estadoId));
        setParroquias([]);
    };

    const handleMunicipioChange = (municipioId: string) => {
        setFormData(prev => ({
            ...prev,
            municipio: municipioId,
            parroquia: ''
        }));
        setParroquias(getParroquiasByMunicipio(formData.estado, municipioId));
    };

    const handleParroquiaChange = (parroquiaId: string) => {
        setFormData(prev => ({
            ...prev,
            parroquia: parroquiaId
        }));
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
                    <MapPin className="w-4 h-4 text-gray-500" />
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Pacientes</h1>
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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estado">Estado *</Label>
                                        <Select
                                            value={formData.estado}
                                            onValueChange={handleEstadoChange}
                                        >
                                            <SelectTrigger id="estado" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="Seleccione un estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {estados.map(estado => (
                                                    <SelectItem key={estado.id} value={estado.id}>
                                                        {estado.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="municipio">Municipio *</Label>
                                        <Select
                                            value={formData.municipio}
                                            onValueChange={handleMunicipioChange}
                                            disabled={!formData.estado}
                                        >
                                            <SelectTrigger id="municipio" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder={formData.estado ? "Seleccione un municipio" : "Seleccione primero el estado"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {municipios.map(municipio => (
                                                    <SelectItem key={municipio.id} value={municipio.id}>
                                                        {municipio.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="parroquia">Parroquia *</Label>
                                        <Select
                                            value={formData.parroquia}
                                            onValueChange={handleParroquiaChange}
                                            disabled={!formData.municipio}
                                        >
                                            <SelectTrigger id="parroquia" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder={formData.municipio ? "Seleccione una parroquia" : "Seleccione primero el municipio"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parroquias.map(parroquia => (
                                                    <SelectItem key={parroquia.id} value={parroquia.id}>
                                                        {parroquia.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
