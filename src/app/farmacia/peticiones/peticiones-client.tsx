'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle, Clock, XCircle, User, Pill } from 'lucide-react';
import { createPeticion, deletePeticion, marcarComoEntregada, getPacientesForSelect, getMedicamentosForSelect, getPeticiones } from '@/actions/peticiones-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Peticion {
    codigoPeticion: string;
    codigoPaciente: string;
    codigoMedicamento: string;
    cantidad: number;
    fechaPeticion: Date;
    estado: string;
    notas?: string | null;
    nombrePaciente: string | null;
    apellidoPaciente: string | null;
    nombreMedicamento: string | null;
    presentacion: string | null;
    existencia: number | null;
}

interface Paciente {
    cedulaPaciente: string;
    nombrePaciente: string;
    apellidoPaciente: string;
}

interface Medicamento {
    codigoMedicamento: string;
    nombreMedicamento: string;
    presentacion: string;
    existencia: number;
}

interface PeticionesClientProps {
    initialData: Peticion[];
}

export default function PeticionesClient({ initialData }: PeticionesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [peticiones, setPeticiones] = React.useState<Peticion[]>(initialData);
    const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
    const [medicamentos, setMedicamentos] = React.useState<Medicamento[]>([]);
    const [selectedPaciente, setSelectedPaciente] = React.useState<string>('');
    const [selectedMedicamento, setSelectedMedicamento] = React.useState<string>('');

    const [formData, setFormData] = React.useState({
        codigoPaciente: '',
        codigoMedicamento: '',
        cantidad: 1,
        notas: '',
    });

    // Cargar pacientes y medicamentos al montar el componente
    React.useEffect(() => {
        loadPacientes();
        loadMedicamentos();
    }, []);

    const loadPacientes = async () => {
        const result = await getPacientesForSelect();
        if (result.success) {
            setPacientes(result.data || []);
        }
    };

    const loadMedicamentos = async () => {
        const result = await getMedicamentosForSelect();
        if (result.success) {
            setMedicamentos(result.data || []);
        }
    };

    const handleAdd = () => {
        setFormData({
            codigoPaciente: '',
            codigoMedicamento: '',
            cantidad: 1,
            notas: '',
        });
        setSelectedPaciente('');
        setSelectedMedicamento('');
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta petición? El stock será devuelto al medicamento.')) {
            const res = await deletePeticion(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
                // Actualizar la lista local
                setPeticiones(prev => prev.filter(p => p.codigoPeticion !== codigo));
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleMarcarEntregada = async (codigo: string) => {
        const res = await marcarComoEntregada(codigo);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
            // Actualizar la lista local
            setPeticiones(prev => 
                prev.map(p => 
                    p.codigoPeticion === codigo 
                        ? { ...p, estado: 'entregado' }
                        : p
                )
            );
        } else {
            toast.error(res.error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validar que los campos requeridos estén presentes
            if (!formData.codigoPaciente) {
                toast.error('Debe seleccionar un paciente');
                return;
            }
            if (!formData.codigoMedicamento) {
                toast.error('Debe seleccionar un medicamento');
                return;
            }
            if (!formData.cantidad || formData.cantidad < 1) {
                toast.error('La cantidad debe ser mayor a 0');
                return;
            }

            const res = await createPeticion(formData);

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
                // Recargar la lista de peticiones y medicamentos
                const [peticionesRes, medicamentosRes] = await Promise.all([
                    getPeticiones(),
                    getMedicamentosForSelect()
                ]);
                
                if (peticionesRes.success) {
                    setPeticiones(peticionesRes.data || []);
                }
                if (medicamentosRes.success) {
                    setMedicamentos(medicamentosRes.data || []);
                }
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

    // Manejar selección de paciente
    const handlePacienteChange = (cedula: string) => {
        setSelectedPaciente(cedula);
        setFormData(prev => ({ ...prev, codigoPaciente: cedula }));
    };

    // Manejar selección de medicamento
    const handleMedicamentoChange = (codigo: string) => {
        setSelectedMedicamento(codigo);
        setFormData(prev => ({ ...prev, codigoMedicamento: codigo }));
    };

    // Obtener nombre completo del paciente
    const getPacienteNombre = (cedula: string) => {
        const paciente = pacientes.find(p => p.cedulaPaciente === cedula);
        return paciente ? `${paciente.nombrePaciente} ${paciente.apellidoPaciente}` : '';
    };

    // Obtener información del medicamento
    const getMedicamentoInfo = (codigo: string) => {
        const medicamento = medicamentos.find(m => m.codigoMedicamento === codigo);
        return medicamento ? `${medicamento.nombreMedicamento} (${medicamento.presentacion}) - Stock: ${medicamento.existencia}` : '';
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</Badge>;
            case 'entregado':
                return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Entregado</Badge>;
            case 'cancelado':
                return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelado</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const columns: Column<Peticion>[] = [
        {
            key: 'codigoPeticion',
            label: 'Código',
        },
        {
            key: 'paciente',
            label: 'Paciente',
            render: (row: Peticion) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium">{row.nombrePaciente} {row.apellidoPaciente}</div>
                        <div className="text-sm text-gray-500">{row.codigoPaciente}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'medicamento',
            label: 'Medicamento',
            render: (row: Peticion) => (
                <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium">{row.nombreMedicamento}</div>
                        <div className="text-sm text-gray-500">{row.presentacion}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'cantidad',
            label: 'Cantidad',
            render: (row: Peticion) => row.cantidad,
        },
        {
            key: 'fechaPeticion',
            label: 'Fecha',
            render: (row: Peticion) => new Date(row.fechaPeticion).toLocaleDateString(),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row: Peticion) => getEstadoBadge(row.estado),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (row: Peticion) => (
                <div className="flex items-center gap-2">
                    {row.estado === 'pendiente' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarcarEntregada(row.codigoPeticion)}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(row.codigoPeticion)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Peticiones de Medicamentos</h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona las solicitudes de medicamentos realizadas por los pacientes
                        </p>
                    </div>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Petición
                    </Button>
                </div>

                <DataTable
                    data={peticiones}
                    columns={columns}
                    searchPlaceholder="Buscar peticiones..."
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Nueva Petición de Medicamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paciente">Paciente</Label>
                                    <Select value={selectedPaciente} onValueChange={handlePacienteChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar paciente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pacientes.map((paciente) => (
                                                <SelectItem key={paciente.cedulaPaciente} value={paciente.cedulaPaciente}>
                                                    {paciente.nombrePaciente} {paciente.apellidoPaciente} ({paciente.cedulaPaciente})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medicamento">Medicamento</Label>
                                    <Select value={selectedMedicamento} onValueChange={handleMedicamentoChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar medicamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {medicamentos.map((medicamento) => (
                                                <SelectItem key={medicamento.codigoMedicamento} value={medicamento.codigoMedicamento}>
                                                    {medicamento.nombreMedicamento} - Stock: {medicamento.existencia}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cantidad">Cantidad Solicitada</Label>
                                    <Input
                                        id="cantidad"
                                        type="number"
                                        min="1"
                                        value={formData.cantidad}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                                        required
                                    />
                                    {selectedMedicamento && (
                                        <p className="text-sm text-gray-500">
                                            Stock disponible: {medicamentos.find(m => m.codigoMedicamento === selectedMedicamento)?.existencia || 0}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nota">Nota (Opcional)</Label>
                                <Textarea
                                    id="nota"
                                    value={formData.notas}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                                    placeholder="Notas adicionales sobre la petición..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Crear Petición'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
