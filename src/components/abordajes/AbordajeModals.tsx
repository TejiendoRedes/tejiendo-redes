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

// --- Edit Abordaje Modal ---
interface EditAbordajeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    abordaje: any;
}

export function EditAbordajeModal({ open, onOpenChange, abordaje }: EditAbordajeModalProps) {
    const [descripcion, setDescripcion] = useState(abordaje.descripcion);
    const [estado, setEstado] = useState(abordaje.estado);
    const [horaInicio, setHoraInicio] = useState(abordaje.horaInicio);
    const [horaFin, setHoraFin] = useState(abordaje.horaFin);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        {
            const res = await updateAbordaje(abordaje.codigoAbordaje, {
                descripcion,
                estado,
                horaInicio,
                horaFin
            });

            if (res.success) {
                onOpenChange(false);
            } else {
                alert(res.error);
            }
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
    const [comunidades, setComunidades] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getComunidades().then(res => {
                if (res.success && res.data) {
                    // Start filtering based on existing IDs if needed, or just let user check
                    // Ideally filter out already added ones
                    setComunidades(res.data.filter((c: any) => !existingIds.includes(c.codigoComunidad)));
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
            alert(res.error);
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
                        <Label>Seleccionar Comunidad</Label>
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una comunidad" />
                            </SelectTrigger>
                            <SelectContent>
                                {comunidades.map(c => (
                                    <SelectItem key={c.codigoComunidad} value={c.codigoComunidad}>
                                        {c.nombreComunidad}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
    const [tejedores, setTejedores] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [rol, setRol] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getTejedores().then(res => {
                if (res.success && res.data) {
                    setTejedores(res.data.filter((t: any) => !existingIds.includes(t.cedulaTejedor)));
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
            alert(res.error);
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
                        <Label>Seleccionar Tejedor</Label>
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tejedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {tejedores.map(t => (
                                    <SelectItem key={t.cedulaTejedor} value={t.cedulaTejedor}>
                                        {t.nombreTejedor} {t.apellidoTejedor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
    fechaAbordaje: string | Date; // Needed for the record
}

export function RegisterMedicamentoModal({ open, onOpenChange, abordajeId, fechaAbordaje }: RegisterMedicamentoModalProps) {
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [tejedores, setTejedores] = useState<any[]>([]);

    const [selectedPaciente, setSelectedPaciente] = useState('');
    const [selectedMedicamento, setSelectedMedicamento] = useState('');
    const [selectedTejedor, setSelectedTejedor] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            getPacientes().then(res => { if (res.success) setPacientes(res.data || []) });
            getMedicamentos().then(res => { if (res.success) setMedicamentos(res.data || []) });
            getTejedores().then(res => { if (res.success) setTejedores(res.data || []) });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedPaciente || !selectedMedicamento || !selectedTejedor) return;
        setLoading(true);

        // Ensure fecha is a Date object
        const fecha = new Date(fechaAbordaje);

        const res = await registerMedicamentoEntrega({
            codigoMedicamento: selectedMedicamento,
            cedulaPaciente: selectedPaciente,
            cedulaTejedor: selectedTejedor,
            codigoAbordaje: abordajeId, // Add this field
            fechaEntrega: fecha,
            cantidadEntregada: cantidad
        });

        if (res.success) {
            onOpenChange(false);
            // Reset form
            setSelectedPaciente('');
            setSelectedMedicamento('');
            setSelectedTejedor('');
            setCantidad(1);
        } else {
            alert(res.error);
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
                        <Label>Paciente</Label>
                        <Select value={selectedPaciente} onValueChange={setSelectedPaciente}>
                            <SelectTrigger>
                                <SelectValue placeholder="Buscar paciente..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {pacientes.map(p => (
                                    <SelectItem key={p.cedulaPaciente} value={p.cedulaPaciente}>
                                        {p.nombre} {p.apellido} - {p.cedulaPaciente}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Medicamento</Label>
                        <Select value={selectedMedicamento} onValueChange={setSelectedMedicamento}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar medicamento" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {medicamentos.map(m => (
                                    <SelectItem key={m.codigoMedicamento} value={m.codigoMedicamento}>
                                        {m.nombreMedicamento} ({m.presentacion})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        <Label>Entregado por (Tejedor)</Label>
                        <Select value={selectedTejedor} onValueChange={setSelectedTejedor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tejedor" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {tejedores.map(t => (
                                    <SelectItem key={t.cedulaTejedor} value={t.cedulaTejedor}>
                                        {t.nombreTejedor} {t.apellidoTejedor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
