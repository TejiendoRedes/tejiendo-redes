'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    updateAbordaje,
    addComunidadToAbordaje,
    addTejedorToAbordaje,
    registerMedicamentoEntrega
} from '@/actions/abordajes-actions';
import { getComunidades } from '@/actions/comunidades-actions';
import { getTejedores } from '@/actions/tejedores-actions';
import { getMedicamentos } from '@/actions/medicamentos-actions';
import { getPacientes } from '@/actions/pacientes-actions';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { AbordajeWithRelations } from '@/types/app-types';
import { Comunidad } from '@/db/schema/comunidades';
import { Tejedor } from '@/db/schema/tejedores';
import { Medicamento } from '@/db/schema/medicamentos';

// Interface for Paciente Option since getPacientes returns a joined object that doesn't strictly match Paciente schema
interface PacienteOption {
    cedulaPaciente: string;
    nombre: string;
    apellido: string;
}

// --- Edit Abordaje Modal ---
interface EditAbordajeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    abordaje: AbordajeWithRelations;
}

export function EditAbordajeModal({ open, onOpenChange, abordaje }: EditAbordajeModalProps) {
    const [descripcion, setDescripcion] = useState(abordaje.descripcion);
    const [estado, setEstado] = useState(abordaje.estado);
    const [horaInicio, setHoraInicio] = useState(abordaje.horaInicio);
    const [horaFin, setHoraFin] = useState(abordaje.horaFin);
    const [tipoAbordaje, setTipoAbordaje] = useState(abordaje.tipoAbordaje || '');
    const [participantesEstimados, setParticipantesEstimados] = useState(abordaje.participantesEstimados || 0);
    const [recursosAdicionales, setRecursosAdicionales] = useState(abordaje.recursosAdicionales || '');
    const [notas, setNotas] = useState(abordaje.notas || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateAbordaje(abordaje.codigoAbordaje, {
            descripcion,
            estado,
            horaInicio,
            horaFin,
            tipoAbordaje,
            participantesEstimados: parseInt(participantesEstimados.toString()) || 0,
            recursosAdicionales,
            notas
        });

        if (res.success) {
            toast.success('Abordaje actualizado correctamente');
            onOpenChange(false);
        } else {
            toast.error(res.error || 'Error al actualizar');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Abordaje</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hora Inicio</Label>
                            <Input
                                type="time"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora Fin</Label>
                            <Input
                                type="time"
                                value={horaFin}
                                onChange={(e) => setHoraFin(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={estado} onValueChange={setEstado}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Planificado">Planificado</SelectItem>
                                <SelectItem value="En Curso">En Curso</SelectItem>
                                <SelectItem value="Finalizado">Finalizado</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Abordaje</Label>
                            <Input
                                value={tipoAbordaje}
                                onChange={(e) => setTipoAbordaje(e.target.value)}
                                placeholder="Ej. Medico, Social..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Participantes Estimados</Label>
                            <Input
                                type="number"
                                value={participantesEstimados}
                                onChange={(e) => setParticipantesEstimados(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Recursos Adicionales</Label>
                        <Textarea
                            value={recursosAdicionales}
                            onChange={(e) => setRecursosAdicionales(e.target.value)}
                            placeholder="Materiales, equipos, etc."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Observaciones Generales</Label>
                        <Textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Add Comunidad Modal ---
interface AddComunidadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    abordajeId: string;
    existingIds: string[];
}

export function AddComunidadModal({ open, onOpenChange, abordajeId, existingIds }: AddComunidadModalProps) {
    const [comunidades, setComunidades] = useState<Comunidad[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getComunidades().then(res => {
                if (res.success && res.data) {
                    setComunidades((res.data as Comunidad[]).filter(c => !existingIds.includes(c.codigoComunidad)));
                }
            });
        }
    }, [open, existingIds]);

    const handleSubmit = async () => {
        if (!selectedId) return;
        setLoading(true);
        const res = await addComunidadToAbordaje(abordajeId, selectedId);
        if (res.success) {
            onOpenChange(false);
            setSelectedId('');
        } else {
            toast.error(res.error || 'Error al asignar comunidad');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Comunidad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Seleccionar Comunidad"
                            items={comunidades}
                            value={selectedId}
                            onValueChange={setSelectedId}
                            placeholder="Seleccione una comunidad"
                            searchPlaceholder="Buscar por nombre o código..."
                            idField="codigoComunidad"
                            labelField="nombreComunidad"
                            secondaryLabelField="parroquia"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        {comunidades.length === 0 && "No hay comunidades disponibles para agregar."}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!selectedId || loading}>Agregar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Add Tejedor Modal ---
interface AddTejedorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    abordajeId: string;
    existingIds: string[];
}

export function AddTejedorModal({ open, onOpenChange, abordajeId, existingIds }: AddTejedorModalProps) {
    const [tejedores, setTejedores] = useState<Tejedor[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getTejedores().then(res => {
                if (res.success && res.data) {
                    setTejedores((res.data as Tejedor[]).filter(t => !existingIds.includes(t.cedulaTejedor)));
                }
            });
        }
    }, [open, existingIds]);

    const handleSubmit = async () => {
        if (!selectedId) return;
        setLoading(true);
        const res = await addTejedorToAbordaje(abordajeId, selectedId, rol);
        if (res.success) {
            onOpenChange(false);
            setSelectedId('');
            setRol('');
        } else {
            toast.error(res.error || 'Error al asignar tejedor');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Tejedor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Seleccionar Tejedor"
                            items={tejedores}
                            value={selectedId}
                            onValueChange={setSelectedId}
                            placeholder="Seleccione un tejedor"
                            searchPlaceholder="Buscar por nombre o cédula..."
                            idField="cedulaTejedor"
                            labelField="nombreTejedor"
                            secondaryLabelField="apellidoTejedor"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Rol en Abordaje</Label>
                        <Select value={rol} onValueChange={setRol}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Coordinador">Coordinador</SelectItem>
                                <SelectItem value="Apoyo Logístico">Apoyo Logístico</SelectItem>
                                <SelectItem value="Médico">Médico</SelectItem>
                                <SelectItem value="Enfermería">Enfermería</SelectItem>
                                <SelectItem value="Registro">Registro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!selectedId || loading}>Agregar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Register Medicamento Modal ---
interface RegisterMedicamentoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    abordajeId: string;
    fechaAbordaje: string | Date;
}

export function RegisterMedicamentoModal({ open, onOpenChange, abordajeId, fechaAbordaje }: RegisterMedicamentoModalProps) {
    const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [tejedores, setTejedores] = useState<Tejedor[]>([]);

    const [selectedPaciente, setSelectedPaciente] = useState('');
    const [selectedMedicamento, setSelectedMedicamento] = useState('');
    const [selectedTejedor, setSelectedTejedor] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getPacientes().then(res => { if (res.success) setPacientes((res.data || []) as unknown as PacienteOption[]) });
            getMedicamentos().then(res => { if (res.success) setMedicamentos((res.data || []) as Medicamento[]) });
            getTejedores().then(res => { if (res.success) setTejedores((res.data || []) as Tejedor[]) });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedPaciente || !selectedMedicamento || !selectedTejedor) return;
        setLoading(true);

        // Ensure date is a valid Date object
        const fecha = typeof fechaAbordaje === 'string' ? new Date(fechaAbordaje) : fechaAbordaje;

        const res = await registerMedicamentoEntrega({
            codigoMedicamento: selectedMedicamento,
            cedulaPaciente: selectedPaciente,
            cedulaTejedor: selectedTejedor,
            codigoAbordaje: abordajeId,
            fechaEntrega: fecha,
            cantidadEntregada: cantidad
        });

        if (res.success) {
            onOpenChange(false);
            setSelectedPaciente('');
            setSelectedMedicamento('');
            setSelectedTejedor('');
            setCantidad(1);
        } else {
            toast.error(res.error || 'Error al registrar entrega');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Entrega de Medicamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <SearchableSelect
                            label="Paciente"
                            items={pacientes}
                            value={selectedPaciente}
                            onValueChange={setSelectedPaciente}
                            placeholder="Seleccionar paciente"
                            searchPlaceholder="Buscar por nombre o cédula..."
                            idField="cedulaPaciente"
                            labelField="nombre" // Ensure your API returns 'nombre' not 'nombrePaciente' if that's what SearchableSelect expects, or update this
                            secondaryLabelField="apellido"
                        />
                    </div>

                    <div className="space-y-2">
                        <SearchableSelect
                            label="Medicamento"
                            items={medicamentos}
                            value={selectedMedicamento}
                            onValueChange={setSelectedMedicamento}
                            placeholder="Seleccionar medicamento"
                            searchPlaceholder="Buscar por nombre o código..."
                            idField="codigoMedicamento"
                            labelField="nombreMedicamento"
                            secondaryLabelField="presentacion"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                            type="number"
                            min="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    <div className="space-y-2">
                        <SearchableSelect
                            label="Entregado por (Tejedor)"
                            items={tejedores}
                            value={selectedTejedor}
                            onValueChange={setSelectedTejedor}
                            placeholder="Seleccionar tejedor"
                            searchPlaceholder="Buscar por nombre o cédula..."
                            idField="cedulaTejedor"
                            labelField="nombreTejedor"
                            secondaryLabelField="apellidoTejedor"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!selectedPaciente || !selectedMedicamento || !selectedTejedor || loading}>
                        Registrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
