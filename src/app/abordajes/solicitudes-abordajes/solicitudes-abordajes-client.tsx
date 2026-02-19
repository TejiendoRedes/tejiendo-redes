'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle, Clock, XCircle, MapPin, Users, Calendar } from 'lucide-react';
import { createSolicitudAbordaje, deleteSolicitudAbordaje, confirmarSolicitudAbordaje, rechazarSolicitudAbordaje } from '@/actions/solicitudes-abordajes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SolicitudAbordaje {
    id: number;
    codigoSolicitud: string;
    codigoComunidad: string;
    fechaSugerida: string;
    horaInicioSugerida: string;
    descripcionActividad: string;
    tipoAbordaje: string;
    participantesEstimados: number;
    recursosAdicionales?: string | null;
    estado: string;
    logisticaLugar: boolean;
    logisticaPersonal: boolean;
    logisticaRefrigerios: boolean;
    logisticaTransporte: boolean;
    fechaSolicitud: Date;
    notas?: string | null;
    comunidad?: Comunidad | null;
}

interface Comunidad {
    codigoComunidad: string;
    nombreComunidad: string;
}

interface SolicitudesAbordajesClientProps {
    initialData: SolicitudAbordaje[];
    comunidades: Comunidad[];
}

export default function SolicitudesAbordajesClient({ initialData, comunidades }: SolicitudesAbordajesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = React.useState<SolicitudAbordaje | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [solicitudes, setSolicitudes] = React.useState<SolicitudAbordaje[]>(initialData);

    // Sincronizar estado local cuando los datos del servidor cambian (router.refresh())
    React.useEffect(() => {
        setSolicitudes(initialData);
    }, [initialData]);

    const [formData, setFormData] = React.useState({
        codigoComunidad: '',
        fechaSugerida: '',
        horaInicioSugerida: '',
        descripcionActividad: '',
        tipoAbordaje: '',
        participantesEstimados: 1,
        recursosAdicionales: '',
    });

    const handleAdd = () => {
        setFormData({
            codigoComunidad: '',
            fechaSugerida: '',
            horaInicioSugerida: '',
            descripcionActividad: '',
            tipoAbordaje: '',
            participantesEstimados: 1,
            recursosAdicionales: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Datos del formulario a enviar:', formData);
            const res = await createSolicitudAbordaje(formData as any);

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                // Recargar la página usando router para evitar redirect al login
                router.push('/abordajes/solicitudes-abordajes');
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

    const handleDelete = async (id: number) => {
        if (confirm('¿Está seguro de eliminar esta solicitud?')) {
            const res = await deleteSolicitudAbordaje(id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
                setSolicitudes(prev => prev.filter(s => s.id !== id));
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleConfirmar = async (id: number) => {
        const res = await confirmarSolicitudAbordaje(id);
        if (res.success) {
            toast.success(res.message);
            router.refresh();
            setSolicitudes(prev =>
                prev.map(s =>
                    s.id === id
                        ? { ...s, estado: 'confirmado' }
                        : s
                )
            );
        } else {
            toast.error(res.error);
        }
    };

    const handleRechazar = async (id: number) => {
        const motivo = prompt('¿Cuál es el motivo del rechazo?');
        if (motivo !== null) {
            const res = await rechazarSolicitudAbordaje(id, motivo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
                setSolicitudes(prev =>
                    prev.map(s =>
                        s.id === id
                            ? { ...s, estado: 'rechazado' }
                            : s
                    )
                );
            } else {
                toast.error(res.error);
            }
        }
    };

    const importAcciones = async () => {
        const { toggleLogisticaCheck } = await import('@/actions/solicitudes-abordajes-actions');
        return { toggleLogisticaCheck };
    };

    const handleToggleCheck = async (id: number, campo: 'logisticaLugar' | 'logisticaPersonal' | 'logisticaRefrigerios' | 'logisticaTransporte', valorActual: boolean) => {
        setIsLoading(true);
        try {
            const { toggleLogisticaCheck } = await importAcciones();
            const res = await toggleLogisticaCheck(id, campo, !valorActual);

            if (res.success) {
                toast.success(res.message);
                router.refresh(); // Vital para que se actualice si se autoconfirma

                // Actualizar localmente para snappiness
                setSolicitudes(prev => prev.map(s => {
                    if (s.id === id) {
                        const newS = { ...s, [campo]: !valorActual };
                        // Si se autoconfirmó (reflejamos localmente la lógica que hará el servidor)
                        if (newS.logisticaLugar && newS.logisticaPersonal && newS.logisticaRefrigerios && newS.logisticaTransporte && newS.estado.toLowerCase() === 'pendiente') {
                            newS.estado = 'confirmado';
                        }
                        return newS;
                    }
                    return s;
                }));

                if (selectedSolicitud && selectedSolicitud.id === id) {
                    const newS = { ...selectedSolicitud, [campo]: !valorActual };
                    if (newS.logisticaLugar && newS.logisticaPersonal && newS.logisticaRefrigerios && newS.logisticaTransporte && newS.estado.toLowerCase() === 'pendiente') {
                        newS.estado = 'confirmado';
                    }
                    setSelectedSolicitud(newS);
                }

            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error al actualizar logística');
        } finally {
            setIsLoading(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        const est = estado.toLowerCase();
        switch (est) {
            case 'pendiente':
                return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</Badge>;
            case 'confirmado':
                return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmado</Badge>;
            case 'rechazado':
                return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rechazado</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };



    const columns: Column<SolicitudAbordaje>[] = [
        {
            key: 'codigoSolicitud',
            label: 'Código',
        },
        {
            key: 'comunidad',
            label: 'Comunidad',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.comunidad?.nombreComunidad || 'N/A'}</div>
                    <span className="ml-1">({row.comunidad?.codigoComunidad || 'N/A'})</span>
                </div>
            ),
        },
        {
            key: 'descripcionActividad',
            label: 'Actividad',
            render: (row) => (
                <div>
                    <div className="font-medium">{row.descripcionActividad}</div>
                    <div className="text-sm text-gray-500">{row.tipoAbordaje}</div>
                </div>
            ),
        },
        {
            key: 'fechaSugerida',
            label: 'Fecha/Hora',
            render: (row) => (
                <div className="text-sm">
                    <div>{row.fechaSugerida}</div>
                    <div className="text-gray-500">{row.horaInicioSugerida}</div>
                </div>
            ),
        },
        {
            key: 'participantesEstimados',
            label: 'Participantes',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    {row.participantesEstimados}
                </div>
            ),
        },

        {
            key: 'estado',
            label: 'Estado',
            render: (row) => (
                <div className="flex flex-col gap-2">
                    {getEstadoBadge(row.estado)}
                </div>
            ),
        },
        {
            key: 'logistica',
            label: 'Validación Logística',
            render: (row) => {
                const est = row.estado.toLowerCase();
                if (est === 'confirmado') return <span className="text-gray-500 text-xs">Completada</span>;
                if (est === 'rechazado') return <span className="text-gray-400 text-xs">-</span>;

                return (
                    <div className="grid grid-cols-2 gap-2 w-max">
                        <div className="flex items-center space-x-1" title="Lugar Disponible">
                            <Checkbox
                                id={`lugar-${row.id}`}
                                checked={row.logisticaLugar}
                                onCheckedChange={() => handleToggleCheck(row.id, 'logisticaLugar', row.logisticaLugar)}
                                disabled={isLoading}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`lugar-${row.id}`} className="text-[11px] cursor-pointer font-normal">Lugar</Label>
                        </div>
                        <div className="flex items-center space-x-1" title="Personal Asignado">
                            <Checkbox
                                id={`personal-${row.id}`}
                                checked={row.logisticaPersonal}
                                onCheckedChange={() => handleToggleCheck(row.id, 'logisticaPersonal', row.logisticaPersonal)}
                                disabled={isLoading}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`personal-${row.id}`} className="text-[11px] cursor-pointer font-normal">Personal</Label>
                        </div>
                        <div className="flex items-center space-x-1" title="Refrigerios Listos">
                            <Checkbox
                                id={`refri-${row.id}`}
                                checked={row.logisticaRefrigerios}
                                onCheckedChange={() => handleToggleCheck(row.id, 'logisticaRefrigerios', row.logisticaRefrigerios)}
                                disabled={isLoading}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`refri-${row.id}`} className="text-[11px] cursor-pointer font-normal">Refrigerios</Label>
                        </div>
                        <div className="flex items-center space-x-1" title="Transporte Confirmado">
                            <Checkbox
                                id={`trans-${row.id}`}
                                checked={row.logisticaTransporte}
                                onCheckedChange={() => handleToggleCheck(row.id, 'logisticaTransporte', row.logisticaTransporte)}
                                disabled={isLoading}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`trans-${row.id}`} className="text-[11px] cursor-pointer font-normal">Transporte</Label>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Ver Detalles y Logística"
                        onClick={() => {
                            setSelectedSolicitud(row);
                            setIsDetailsModalOpen(true);
                        }}
                    >
                        Ver Detalle / Logística
                    </Button>
                    {row.estado.toLowerCase() === 'pendiente' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Rechazar"
                                onClick={() => handleRechazar(row.id)}
                            >
                                <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => handleDelete(row.id)}
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Solicitudes de Abordajes</h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona las solicitudes de abordajes comunitarios pendientes de confirmación
                        </p>
                    </div>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Solicitud
                    </Button>
                </div>

                <DataTable
                    data={solicitudes}
                    columns={columns}
                    searchPlaceholder="Buscar solicitudes..."
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px] scroll-y">
                        <DialogHeader>
                            <DialogTitle>Nueva Solicitud de Abordaje</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="comunidad">Comunidad</Label>
                                    <Select value={formData.codigoComunidad} onValueChange={(value) => setFormData(prev => ({ ...prev, codigoComunidad: value }))} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar comunidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {comunidades.map((comunidad) => (
                                                <SelectItem key={comunidad.codigoComunidad} value={comunidad.codigoComunidad}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{comunidad.nombreComunidad}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha">Fecha Sugerida</Label>
                                    <Input
                                        id="fecha"
                                        type="date"
                                        value={formData.fechaSugerida}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fechaSugerida: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hora">Hora Inicio</Label>
                                    <Input
                                        id="hora"
                                        type="time"
                                        value={formData.horaInicioSugerida}
                                        onChange={(e) => setFormData(prev => ({ ...prev, horaInicioSugerida: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo de Abordaje</Label>
                                    <Select value={formData.tipoAbordaje} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoAbordaje: value }))} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Educativo">Educativo</SelectItem>
                                            <SelectItem value="Médico">Médico</SelectItem>
                                            <SelectItem value="Social">Social</SelectItem>
                                            <SelectItem value="Deportivo">Deportivo</SelectItem>
                                            <SelectItem value="Cultural">Cultural</SelectItem>
                                            <SelectItem value="Religioso">Religioso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="participantes">Participantes Estimados</Label>
                                    <NumberInput
                                        id="participantes"
                                        value={formData.participantesEstimados}
                                        onChange={(val) => setFormData(prev => ({ ...prev, participantesEstimados: parseInt(val) || 1 }))}
                                        required
                                        suffix="pers"
                                        allowDecomal={false}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción de la Actividad</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcionActividad}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descripcionActividad: e.target.value }))}
                                    placeholder="Describe la actividad que se realizará..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recursos">Recursos Adicionales Necesarios</Label>
                                <Textarea
                                    id="recursos"
                                    value={formData.recursosAdicionales}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recursosAdicionales: e.target.value }))}
                                    placeholder="¿Qué recursos adicionales se necesitan para el abordaje?"
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creando...' : 'Crear Solicitud'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Detalles y Logística */}
                <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                    <DialogContent className="sm:max-w-[700px] scroll-y">
                        <DialogHeader>
                            <DialogTitle>Detalle y Logística de Solicitud</DialogTitle>
                            <DialogDescription>
                                Revise los detalles y gestione la aprobación logística.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSolicitud && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Comunidad</h4>
                                        <p>{selectedSolicitud.comunidad?.nombreComunidad} ({selectedSolicitud.codigoComunidad})</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                                        <div className="mt-1">{getEstadoBadge(selectedSolicitud.estado)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium text-gray-500">Actividad</h4>
                                        <p>{selectedSolicitud.descripcionActividad}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Fecha y Hora</h4>
                                        <p>{selectedSolicitud.fechaSugerida} a las {selectedSolicitud.horaInicioSugerida}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Participantes Estimados</h4>
                                        <p>{selectedSolicitud.participantesEstimados} personas</p>
                                    </div>
                                </div>

                                {selectedSolicitud.estado.toLowerCase() === 'pendiente' && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">Validación Logística</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Al marcar todas las validaciones como listas, la solicitud se confirmará automáticamente y pasará a ser un Abordaje planificado.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm h-[80px]">
                                                <Checkbox
                                                    checked={selectedSolicitud.logisticaLugar}
                                                    onCheckedChange={() => handleToggleCheck(selectedSolicitud.id, 'logisticaLugar', selectedSolicitud.logisticaLugar)}
                                                    disabled={isLoading || selectedSolicitud.estado.toLowerCase() !== 'pendiente'}
                                                />
                                                <div className="space-y-1 leading-none">
                                                    <Label>Lugar Disponible</Label>
                                                    <p className="text-xs text-muted-foreground">Confirmar espacio físico.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm h-[80px]">
                                                <Checkbox
                                                    checked={selectedSolicitud.logisticaPersonal}
                                                    onCheckedChange={() => handleToggleCheck(selectedSolicitud.id, 'logisticaPersonal', selectedSolicitud.logisticaPersonal)}
                                                    disabled={isLoading || selectedSolicitud.estado.toLowerCase() !== 'pendiente'}
                                                />
                                                <div className="space-y-1 leading-none">
                                                    <Label>Personal Asignado</Label>
                                                    <p className="text-xs text-muted-foreground">Personal confirmado para asistir.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm h-[80px]">
                                                <Checkbox
                                                    checked={selectedSolicitud.logisticaRefrigerios}
                                                    onCheckedChange={() => handleToggleCheck(selectedSolicitud.id, 'logisticaRefrigerios', selectedSolicitud.logisticaRefrigerios)}
                                                    disabled={isLoading || selectedSolicitud.estado.toLowerCase() !== 'pendiente'}
                                                />
                                                <div className="space-y-1 leading-none">
                                                    <Label>Refrigerios Listos</Label>
                                                    <p className="text-xs text-muted-foreground">Insumos y comida preparada.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm h-[80px]">
                                                <Checkbox
                                                    checked={selectedSolicitud.logisticaTransporte}
                                                    onCheckedChange={() => handleToggleCheck(selectedSolicitud.id, 'logisticaTransporte', selectedSolicitud.logisticaTransporte)}
                                                    disabled={isLoading || selectedSolicitud.estado.toLowerCase() !== 'pendiente'}
                                                />
                                                <div className="space-y-1 leading-none">
                                                    <Label>Transporte Confirmado</Label>
                                                    <p className="text-xs text-muted-foreground">Camioneta/buses asegurados.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedSolicitud.estado.toLowerCase() === 'confirmado' && (
                                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                                        <div className="flex gap-2 items-center mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <h3 className="font-semibold text-green-900">Solicitud Confirmada</h3>
                                        </div>
                                        <p className="text-sm">Esta solicitud ha sido confirmada y se ha generado un Abordaje. Todos los preparativos logísticos fueron completados.</p>
                                    </div>
                                )}
                                {selectedSolicitud.estado.toLowerCase() === 'rechazado' && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                                        <div className="flex gap-2 items-center mb-2">
                                            <XCircle className="w-5 h-5 text-red-600" />
                                            <h3 className="font-semibold text-red-900">Solicitud Rechazada</h3>
                                        </div>
                                        {selectedSolicitud.notas && (
                                            <p className="text-sm mt-2"><b>Motivo:</b> {selectedSolicitud.notas}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDetailsModalOpen(false)}
                                    >
                                        Cerrar
                                    </Button>
                                    {selectedSolicitud.estado.toLowerCase() === 'pendiente' && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                setIsDetailsModalOpen(false);
                                                handleRechazar(selectedSolicitud.id);
                                            }}
                                        >
                                            Rechazar Solicitud
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
