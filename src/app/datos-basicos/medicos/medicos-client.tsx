'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Stethoscope, User, ClipboardList } from 'lucide-react';
import { Tejedor } from '@/db/schema/tejedores';
import { Especialidad } from '@/db/schema/especialidades';
import { createMedico, deleteMedico, updateMedico } from '@/actions/medicos-actions';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio, getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface MedicoWithRelations {
    cedulaTejedor: string;
    codigoEspecialidad: string;
    matriculaColegioMedico: string;
    matriculaSanidad: string;
    tejedor: Tejedor | null;
    especialidad: Especialidad | null;
}

interface MedicosClientProps {
    initialMedicos: MedicoWithRelations[];
    tejedores: Tejedor[];
    especialidades: Especialidad[];
}

export default function MedicosClient({ initialMedicos, tejedores, especialidades }: MedicosClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('tejedor');
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        cedulaTejedor: '',
        codigoEspecialidad: '',
        matriculaColegioMedico: '',
        matriculaSanidad: '',
    });

    const [isEditing, setIsEditing] = React.useState(false);

    // Tejedores que aún no son médicos (solo para crear)
    const tejedoresDisponibles = tejedores.filter(t =>
        !initialMedicos.some(m => m.cedulaTejedor === t.cedulaTejedor)
    );

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({
            cedulaTejedor: '',
            codigoEspecialidad: '',
            matriculaColegioMedico: '',
            matriculaSanidad: '',
        });
        setActiveTab('tejedor');
        setIsModalOpen(true);
    };

    const handleEdit = (medico: MedicoWithRelations) => {
        setIsEditing(true);
        setFormData({
            cedulaTejedor: medico.cedulaTejedor,
            codigoEspecialidad: medico.codigoEspecialidad,
            matriculaColegioMedico: medico.matriculaColegioMedico,
            matriculaSanidad: medico.matriculaSanidad,
        });
        // Si editamos, saltamos directo a la especialidad o permitimos ver el tejedor (read-only)
        setActiveTab('especialidad');
        setIsModalOpen(true);
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar esta asignación de médico?')) {
            const res = await deleteMedico(cedula);
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

        if (!formData.cedulaTejedor || !formData.codigoEspecialidad || !formData.matriculaColegioMedico || !formData.matriculaSanidad) {
            toast.error('Por favor complete todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await updateMedico(formData.cedulaTejedor, formData);
            } else {
                res = await createMedico(formData);
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

    const columns: Column<MedicoWithRelations>[] = [
        {
            key: 'cedulaTejedor',
            label: 'Cédula',
            sortable: true
        },
        {
            key: 'nombre_completo', // Virtual column key
            label: 'Nombre Completo',
            render: (m) => m.tejedor ? `${m.tejedor.nombreTejedor} ${m.tejedor.apellidoTejedor}` : 'N/A',
            sortable: true,
        },
        {
            key: 'especialidad',
            label: 'Especialidad',
            render: (m) => m.especialidad ? m.especialidad.nombreEspecialidad : m.codigoEspecialidad
        },
        {
            key: 'telefono', // Virtual column
            label: 'Teléfono',
            render: (m) => m.tejedor ? m.tejedor.telefonoTejedor : '-'
        },
        {
            key: 'correo', // Virtual column
            label: 'Correo',
            render: (m) => m.tejedor ? m.tejedor.correoTejedor : '-'
        },
        {
            key: 'ubicacion', // Virtual column
            label: 'Ubicación',
            render: (m) => m.tejedor ? (
                (() => {
                    const estadoNombre = getEstadoNombre(m.tejedor.estadoTejedor);
                    const municipioNombre = getMunicipioNombre(m.tejedor.estadoTejedor, m.tejedor.municipioTejedor);
                    const parroquiaNombre = getParroquiaNombre(m.tejedor.estadoTejedor, m.tejedor.municipioTejedor, m.tejedor.parroquiaTejedor);

                    return (
                        <div className="text-sm">
                            <div className="font-medium">{estadoNombre || '-'}</div>
                            <div className="text-gray-500">{municipioNombre || '-'}</div>
                            <div className="text-gray-400">{parroquiaNombre || '-'}</div>
                        </div>
                    );
                })()
            ) : '-'
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (m) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEdit(m)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                        onClick={() => handleDelete(m.cedulaTejedor)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Médicos</h1>
                        <p className="text-gray-600">
                            Gestión de médicos registrados en el sistema
                        </p>
                    </div>
                </div>

                <DataTable
                    data={initialMedicos}
                    columns={columns}
                    searchPlaceholder="Buscar médico..."
                    onAdd={handleAdd}
                    addLabel="Asignar Médico"
                />

                {/* Modal Formulario con Pestañas */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                                {isEditing ? 'Editar Asignación' : 'Asignar Nuevo Médico'}
                            </DialogTitle>
                            <DialogDescription>
                                Complete la información para habilitar a un tejedor como médico activo.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="tejedor" className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Personal
                                    </TabsTrigger>
                                    <TabsTrigger value="especialidad" className="flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" />
                                        Datos Médicos
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="tejedor" className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tejedor">Seleccionar Tejedor (Médicos no asignados)</Label>
                                        <Select
                                            value={formData.cedulaTejedor}
                                            onValueChange={(val) => setFormData({ ...formData, cedulaTejedor: val })}
                                            disabled={isEditing} // No se puede cambiar el tejedor al editar (es PK part)
                                        >
                                            <SelectTrigger id="tejedor" className="h-12 text-lg">
                                                <SelectValue placeholder="Busque por nombre o cédula..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isEditing ? (
                                                    // Show selected user when editing
                                                    tejedores.filter(t => t.cedulaTejedor === formData.cedulaTejedor).map(t => (
                                                        <SelectItem key={t.cedulaTejedor} value={t.cedulaTejedor}>
                                                            {t.cedulaTejedor} - {t.nombreTejedor} {t.apellidoTejedor}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    tejedoresDisponibles.length > 0 ? (
                                                        tejedoresDisponibles.map(t => (
                                                            <SelectItem key={t.cedulaTejedor} value={t.cedulaTejedor}>
                                                                {t.cedulaTejedor} - {t.nombreTejedor} {t.apellidoTejedor}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500 text-sm">
                                                            No hay tejedores disponibles para asignar.
                                                        </div>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {isEditing ? 'El tejedor no se puede modificar.' : 'Solo se muestran tejedores que no han sido asignados como médicos.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={() => setActiveTab('especialidad')}
                                            disabled={!formData.cedulaTejedor}
                                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                        >
                                            Siguiente: Datos Médicos
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="especialidad" className="space-y-6 py-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="especialidad">Especialidad Médica *</Label>
                                            <Select
                                                value={formData.codigoEspecialidad}
                                                onValueChange={(val) => setFormData({ ...formData, codigoEspecialidad: val })}
                                            >
                                                <SelectTrigger id="especialidad" className="h-11">
                                                    <SelectValue placeholder="Seleccione especialidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {especialidades.map(e => (
                                                        <SelectItem key={e.codigoEspecialidad} value={e.codigoEspecialidad}>
                                                            {e.nombreEspecialidad}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="m_colegio">Matrícula Colegio Médico *</Label>
                                            <Input
                                                id="m_colegio"
                                                placeholder="Ej. MPPS-123456"
                                                value={formData.matriculaColegioMedico}
                                                onChange={(e) => setFormData({ ...formData, matriculaColegioMedico: e.target.value })}
                                                className="h-11"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="m_sanidad">Matrícula Sanidad *</Label>
                                            <Input
                                                id="m_sanidad"
                                                placeholder="Ej. MS-998877"
                                                value={formData.matriculaSanidad}
                                                onChange={(e) => setFormData({ ...formData, matriculaSanidad: e.target.value })}
                                                className="h-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTab('tejedor')}
                                        >
                                            Atrás
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                            disabled={isLoading || !formData.codigoEspecialidad || !formData.matriculaColegioMedico}
                                        >
                                            {isLoading ? 'Guardando...' : 'Finalizar Asignación'}
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
