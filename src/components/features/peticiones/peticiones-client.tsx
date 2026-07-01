'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { DataTable, type Column } from '@/components/ui-kit/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle, Clock, XCircle, User, Pill, Calendar, ClipboardList, Eye } from 'lucide-react';
import { createPeticion, deletePeticion, marcarComoEntregada, updatePeticionEstado } from '@/actions/peticiones-actions';
import { getPacientesForSelect, getMedicamentosForSelect, getPeticiones, getAbordajesForSelect } from '@/queries/peticiones';;
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SearchableSelect } from '@/components/shared/SearchableSelect';

interface Peticion {
    codigoPeticion: string;
    codigoPaciente: string;
    codigoMedicamento: string;
    cantidad: number;
    fechaPeticion: Date;
    fechaEntrega?: Date | null;
    horaEntrega?: string | null;
    estado: string;
    notas?: string | null;
    codigoAbordaje?: string | null;
    descripcionAbordaje?: string | null;
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

interface Abordaje {
    codigoAbordaje: string;
    descripcion: string;
    fechaAbordaje: Date;
}

interface PeticionesClientProps {
    initialData: Peticion[];
}

export default function PeticionesClient({ initialData }: PeticionesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const [selectedPeticion, setSelectedPeticion] = React.useState<Peticion | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [peticiones, setPeticiones] = React.useState<Peticion[]>(initialData);

    // Sincronizar estado local cuando los datos del servidor cambian (router.refresh())
    React.useEffect(() => {
        setPeticiones(initialData);
    }, [initialData]);

    const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
    const [medicamentos, setMedicamentos] = React.useState<Medicamento[]>([]);
    const [abordajes, setAbordajes] = React.useState<Abordaje[]>([]);
    const [selectedPaciente, setSelectedPaciente] = React.useState<string>('');
    const [selectedMedicamento, setSelectedMedicamento] = React.useState<string>('');
    const [selectedAbordaje, setSelectedAbordaje] = React.useState<string>('');
    const [isAbordaje, setIsAbordaje] = React.useState(false);

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
        loadAbordajes();
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

    const loadAbordajes = async () => {
        const result = await getAbordajesForSelect();
        if (result.success) {
            setAbordajes(result.data || []);
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
        setSelectedAbordaje('');
        setIsAbordaje(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta petición? La existencia será devuelta al medicamento.')) {
            // Extraer el ID numérico del código de petición
            const id = parseInt(codigo);
            const res = await deletePeticion(id);
            if (res.success) {
                toast.success(res.message);
                setIsDetailsModalOpen(false);
                router.refresh();
                // Actualizar la lista local
                setPeticiones(prev => prev.filter(p => p.codigoPeticion !== codigo));
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleMarcarEntregada = async (codigo: string) => {
        // Extraer el ID numérico del código de petición
        const id = parseInt(codigo);
        const res = await updatePeticionEstado(id, 'entregado');
        if (res.success) {
            toast.success(res.message);
            setIsDetailsModalOpen(false);
            router.refresh();
            // Actualizar la lista local con estado, fecha y hora de entrega
            const ahora = new Date();
            const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;
            setPeticiones(prev =>
                prev.map(p =>
                    p.codigoPeticion === codigo
                        ? { ...p, estado: 'entregado', fechaEntrega: ahora, horaEntrega: horaActual }
                        : p
                )
            );
        } else {
            toast.error(res.error);
        }
    };

    const handleCancelarEntrega = async (codigo: string) => {
        if (confirm('¿Está seguro de cancelar esta entrega? Los medicamentos serán devueltos al inventario.')) {
            // Extraer el ID numérico del código de petición
            const id = parseInt(codigo);
            const res = await updatePeticionEstado(id, 'cancelado');
            if (res.success) {
                toast.success(res.message);
                setIsDetailsModalOpen(false);
                router.refresh();
                // Actualizar la lista local limpiando fecha y hora de entrega
                setPeticiones(prev =>
                    prev.map(p =>
                        p.codigoPeticion === codigo
                            ? { ...p, estado: 'cancelado', fechaEntrega: null, horaEntrega: null }
                            : p
                    )
                );
            } else {
                toast.error(res.error);
            }
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

            const res = await createPeticion({
                ...formData,
                codigoAbordaje: isAbordaje ? selectedAbordaje : null
            });

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
        return medicamento ? `${medicamento.nombreMedicamento} (${medicamento.presentacion}) - Existencia: ${medicamento.existencia}` : '';
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pendiente</Badge>;
            case 'entregado':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Entregado</Badge>;
            case 'cancelado':
                return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Cancelado</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">{estado}</Badge>;
        }
    };

    const columns: Column<Peticion>[] = [
        {
            key: 'codigoPeticion',
            header: 'Código',
            className: 'w-[1%] whitespace-nowrap',
            render: (row: Peticion) => <span className="font-medium text-gray-900">{row.codigoPeticion}</span>
        },
        {
            key: 'paciente',
            header: 'Paciente',
            className: 'min-w-[150px]',
            render: (row: Peticion) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium text-gray-900">{row.nombrePaciente} {row.apellidoPaciente}</div>
                        <div className="text-sm text-gray-500">{row.codigoPaciente}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'medicamento',
            header: 'Medicamento',
            className: 'min-w-[150px]',
            render: (row: Peticion) => (
                <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium text-gray-900">{row.nombreMedicamento}</div>
                        <div className="text-sm text-gray-500">{row.presentacion}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'cantidad',
            header: 'Cantidad',
            className: 'w-[1%] whitespace-nowrap text-center',
            render: (row: Peticion) => row.cantidad,
        },
        {
            key: 'fechaPeticion',
            header: 'Fecha Solicitud',
            className: 'w-[1%] whitespace-nowrap',
            render: (row: Peticion) => new Date(row.fechaPeticion).toLocaleDateString(),
        },
        {
            key: 'fechaEntrega',
            header: 'Fecha y Hora Entrega',
            className: 'w-[1%] whitespace-nowrap',
            render: (row: Peticion) => (
                row.fechaEntrega && row.horaEntrega ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span className="text-sm">
                                {new Date(row.fechaEntrega).toLocaleDateString('es-VE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">
                                {row.horaEntrega.slice(0, 5)} {/* HH:MM */}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            ),
        },
        {
            key: 'abordaje',
            header: 'Abordaje',
            className: 'w-[1%] whitespace-nowrap',
            render: (row: Peticion) => (
                row.codigoAbordaje ? (
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-500" />
                        <div>
                            <div className="font-medium">{row.descripcionAbordaje}</div>
                            <div className="text-xs text-gray-500">{row.codigoAbordaje}</div>
                        </div>
                    </div>
                ) : (
                    <Badge variant="outline" className="text-gray-400 font-normal">Independiente</Badge>
                )
            ),
        },
        {
            key: 'estado',
            header: 'Estado',
            className: 'w-[1%] whitespace-nowrap',
            render: (row: Peticion) => getEstadoBadge(row.estado),
        },
        {
            key: 'acciones',
            header: '',
            className: 'w-[1%] whitespace-nowrap text-right pr-6',
            render: (row: Peticion) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedPeticion(row);
                            setIsDetailsModalOpen(true);
                        }}
                        className="hover:bg-[#1e3a8a]/10 hover:text-[#1e3a8a] text-gray-600 font-medium px-2 py-1 h-8"
                    >
                        <Eye className="w-4 h-4 mr-1.5" /> Revisar
                    </Button>
                    {row.estado === 'pendiente' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(row.codigoPeticion)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar petición"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <PageShell 
                title="Entrega de Medicamentos" 
                subtitle="Gestiona las entregas de medicamentos de forma independiente o en abordajes"
                actions={
                    <Button onClick={handleAdd} className="gap-2 bg-[#1e3a8a] text-white hover:bg-blue-800 rounded-xl shadow-sm">
                        <Plus className="w-4 h-4" />
                        Nueva Entrega
                    </Button>
                }
            >
                <DataTable
                    title="Listado de entregas"
                    description="Busca por código de petición, paciente o medicamento"
                    data={peticiones}
                    columns={columns}
                    searchKeys={['codigoPeticion', 'nombrePaciente', 'apellidoPaciente', 'codigoPaciente', 'nombreMedicamento']}
                    searchPlaceholder="Buscar peticiones..."
                    filters={[
                        {
                            key: 'estado',
                            label: 'Estado',
                            options: [
                                { label: 'Pendiente', value: 'pendiente' },
                                { label: 'Entregado', value: 'entregado' },
                                { label: 'Cancelado', value: 'cancelado' }
                            ]
                        }
                    ]}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Nueva Entrega/Petición de Medicamento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <SearchableSelect
                                        label="Paciente"
                                        items={pacientes}
                                        value={selectedPaciente}
                                        onValueChange={handlePacienteChange}
                                        placeholder="Seleccionar paciente"
                                        searchPlaceholder="Buscar por nombre o cédula..."
                                        idField="cedulaPaciente"
                                        labelField="nombrePaciente"
                                        secondaryLabelField="apellidoPaciente"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <SearchableSelect
                                        label="Medicamento"
                                        items={medicamentos}
                                        value={selectedMedicamento}
                                        onValueChange={handleMedicamentoChange}
                                        placeholder="Seleccionar medicamento"
                                        searchPlaceholder="Buscar por nombre o código..."
                                        idField="codigoMedicamento"
                                        labelField="nombreMedicamento"
                                        secondaryLabelField="presentacion"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 py-4">
                                <Checkbox
                                    id="is-abordaje"
                                    checked={isAbordaje}
                                    onCheckedChange={(checked) => setIsAbordaje(checked === true)}
                                />
                                <Label htmlFor="is-abordaje" className="cursor-pointer">¿Esta entrega se realizó en un abordaje?</Label>
                            </div>

                            {isAbordaje && (
                                <div className="space-y-1 pb-4 border-b">
                                    <SearchableSelect
                                        label="Seleccionar Abordaje"
                                        items={abordajes}
                                        value={selectedAbordaje}
                                        onValueChange={setSelectedAbordaje}
                                        placeholder="Buscar abordaje..."
                                        searchPlaceholder="Descripción o código..."
                                        idField="codigoAbordaje"
                                        labelField="descripcion"
                                        secondaryLabelField="codigoAbordaje"
                                    />
                                </div>
                            )}

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
                                            Existencia disponible: {medicamentos.find(m => m.codigoMedicamento === selectedMedicamento)?.existencia || 0}
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
                                    {isLoading ? 'Guardando...' : 'Crear Entrega'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Detalles */}
                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Petición</DialogTitle>
                            <DialogDescription>
                                Revise los datos de la entrega y gestione su estado.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedPeticion && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Paciente</h4>
                                        <p className="font-medium text-gray-900">{selectedPeticion.nombrePaciente} {selectedPeticion.apellidoPaciente}</p>
                                        <p className="text-xs text-gray-500">CI: {selectedPeticion.codigoPaciente}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                                        <div className="mt-1">{getEstadoBadge(selectedPeticion.estado)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium text-gray-500">Medicamento</h4>
                                        <div className="flex items-center gap-2">
                                            <Pill className="w-4 h-4 text-blue-500" />
                                            <p className="font-medium text-gray-900">{selectedPeticion.nombreMedicamento} ({selectedPeticion.presentacion})</p>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">x{selectedPeticion.cantidad}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Fecha de Solicitud</h4>
                                        <p>{new Date(selectedPeticion.fechaPeticion).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Abordaje (Opcional)</h4>
                                        {selectedPeticion.codigoAbordaje ? (
                                            <p className="text-sm">{selectedPeticion.descripcionAbordaje} <span className="text-gray-400">({selectedPeticion.codigoAbordaje})</span></p>
                                        ) : (
                                            <p className="text-gray-400">-</p>
                                        )}
                                    </div>
                                    {selectedPeticion.notas && (
                                        <div className="col-span-2">
                                            <h4 className="text-sm font-medium text-gray-500">Notas Adicionales</h4>
                                            <p className="text-sm italic text-gray-600 bg-white p-2 rounded border border-gray-100">{selectedPeticion.notas}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDetailsModalOpen(false)}
                                    >
                                        Cerrar
                                    </Button>

                                    {selectedPeticion.estado === 'pendiente' && (
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleMarcarEntregada(selectedPeticion.codigoPeticion)}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Marcar como Entregado
                                        </Button>
                                    )}

                                    {selectedPeticion.estado === 'entregado' && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleCancelarEntrega(selectedPeticion.codigoPeticion)}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancelar Entrega
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </PageShell>
        </MainLayout >
    );
}
