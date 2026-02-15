'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, CheckCircle, Clock, XCircle, MapPin, Users, Calendar, Truck, Coffee, Home } from 'lucide-react';
import { createSolicitudAbordaje, deleteSolicitudAbordaje, confirmarSolicitudAbordaje, rechazarSolicitudAbordaje } from '@/actions/solicitudes-abordajes-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
    // Campos de logística
    transporte: boolean;
    refrigerios: boolean;
    espacioCubierto: boolean;
    notasLogistica?: string | null;
    estado: string;
    fechaSolicitud: Date;
    notas?: string | null;
    comunidad?: any;
}

interface Comunidad {
    codigoComunidad: string;
    nombreComunidad: string;
    // Campos de logística con nombres correctos
    transporte?: boolean;
    refrigerios?: boolean;
    espacioCubierto?: boolean;
}

interface SolicitudesAbordajesClientProps {
    initialData: SolicitudAbordaje[];
    comunidades: Comunidad[];
}

export default function SolicitudesAbordajesClient({ initialData, comunidades }: SolicitudesAbordajesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [solicitudes, setSolicitudes] = React.useState<SolicitudAbordaje[]>(initialData);

    const [formData, setFormData] = React.useState({
        codigoComunidad: '',
        fechaSugerida: '',
        horaInicioSugerida: '',
        descripcionActividad: '',
        tipoAbordaje: '',
        participantesEstimados: 1,
        recursosAdicionales: '',
        // Campos de logística - nombres corregidos
        transporte: false,
        refrigerios: false,
        espacioCubierto: false,
        notasLogistica: '',
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
            // Campos de logística - nombres corregidos
            transporte: false,
            refrigerios: false,
            espacioCubierto: false,
            notasLogistica: '',
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

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
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

    const getLogisticaIcons = (recursos: any) => {
        if (!recursos) return [];

        const icons = [];
        if (recursos.transporte) icons.push(<Truck key='transporte' className="w-4 h-4 text-green-600" />);
        if (recursos.refrigerios) icons.push(<Coffee key='refrigerios' className="w-4 h-4 text-blue-600" />);
        if (recursos.espacioCubierto) icons.push(<Home key='espacio' className="w-4 h-4 text-purple-600" />);
        return icons;
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
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        {row.comunidad && getLogisticaIcons(row.comunidad)}
                        <span className="ml-1">({row.comunidad?.puntuacionLogistica || 0} pts)</span>
                    </div>
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
            key: 'logistica',
            label: 'Logística',
            render: (row) => (
                <div className="flex items-center gap-1">
                    {getLogisticaIcons(row)}
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (row) => getEstadoBadge(row.estado),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    {row.estado === 'pendiente' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Confirmar"
                                onClick={() => handleConfirmar(row.id)}
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
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
                                                        <div className="flex items-center gap-1 ml-2">
                                                            {getLogisticaIcons(comunidad)}
                                                        </div>
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

                            <div className="space-y-4">
                                <Label className="text-sm font-semibold text-gray-700">Recursos Logísticos de la Comunidad</Label>
                                <p className="text-sm text-gray-600">Seleccione los recursos logísticos que tiene disponibles la comunidad para este abordaje</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <Checkbox
                                            id="transporte"
                                            checked={formData.transporte}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, transporte: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="transporte" className="flex items-center gap-2 cursor-pointer">
                                            <Truck className="w-4 h-4 text-green-600" />
                                            <span>Transporte</span>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <Checkbox
                                            id="refrigerios"
                                            checked={formData.refrigerios}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, refrigerios: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="refrigerios" className="flex items-center gap-2 cursor-pointer">
                                            <Coffee className="w-4 h-4 text-blue-600" />
                                            <span>Refrigerios</span>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <Checkbox
                                            id="espacioCubierto"
                                            checked={formData.espacioCubierto}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, espacioCubierto: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="espacioCubierto" className="flex items-center gap-2 cursor-pointer">
                                            <Home className="w-4 h-4 text-purple-600" />
                                            <span>Espacio Cubierto</span>
                                        </Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notasLogistica">Notas Adicionales de Logística</Label>
                                    <Textarea
                                        id="notasLogistica"
                                        value={formData.notasLogistica}
                                        onChange={(e) => setFormData({ ...formData, notasLogistica: e.target.value })}
                                        placeholder="Describe cualquier detalle adicional sobre los recursos logísticos..."
                                        rows={2}
                                    />
                                </div>
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
            </div>
        </MainLayout>
    );
}
