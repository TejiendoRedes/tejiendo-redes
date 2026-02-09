'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, MapPin, Phone, Mail, Calendar, Briefcase, Users, Clock } from 'lucide-react';
import { Aspirante } from '@/db/schema/aspirantes';
import { createAspirante, deleteAspirante, updateAspirante } from '@/actions/aspirantes-actions';
import { promoteAspiranteToTejedor } from '@/actions/promote-aspirante';
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
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio, getEstadoNombre, getMunicipioNombre, getParroquiaNombre } from '@/data/venezuela-location';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Clipboard } from 'lucide-react';

interface AspirantesClientProps {
    initialData: Aspirante[];
}

export default function AspirantesClient({ initialData }: AspirantesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingAspirante, setEditingAspirante] = React.useState<Aspirante | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPromoting, setIsPromoting] = React.useState<string | null>(null);

    const initialFormState = {
        cedulaAspirante: '',
        nombreAspirante: '',
        apellidoAspirante: '',
        fechaNacimiento: '', // Campo crítico
        direccionAspirante: '',
        municipioAspirante: '',
        estadoDireccionAspirante: '',
        parroquiaAspirante: '',
        telefonoAspirante: '',
        correoAspirante: '',
        profesionAspirante: '',
        fechaPostulacion: new Date().toISOString().split('T')[0],
        estadoAspirante: 'Pendiente',
    };

    const [formData, setFormData] = React.useState(initialFormState);

    const [estados] = React.useState(getEstados());
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    const handlePromote = async (aspirante: Aspirante) => {
        if (!confirm(`¿Deseas promover a ${aspirante.nombreAspirante} ${aspirante.apellidoAspirante} a Tejedor Oficial?`)) return;
        setIsPromoting(aspirante.cedulaAspirante);
        try {
            const res = await promoteAspiranteToTejedor(aspirante.cedulaAspirante);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error('Error promoting aspirante:', error);
            toast.error('Error al promover aspirante');
        } finally {
            setIsPromoting(null);
        }
    };

    const handleAdd = () => {
        setEditingAspirante(null);
        setFormData(initialFormState);
        setMunicipios([]);
        setParroquias([]);
        setIsModalOpen(true);
    };

    const handleEdit = (aspirante: Aspirante) => {
        setEditingAspirante(aspirante);
        setFormData({
            cedulaAspirante: aspirante.cedulaAspirante,
            nombreAspirante: aspirante.nombreAspirante,
            apellidoAspirante: aspirante.apellidoAspirante,
            fechaNacimiento: aspirante.fechaNacimiento ? new Date(aspirante.fechaNacimiento).toISOString().split('T')[0] : '',
            direccionAspirante: aspirante.direccionAspirante || '',
            municipioAspirante: aspirante.municipioAspirante || '',
            estadoDireccionAspirante: aspirante.estadoDireccionAspirante || '',
            parroquiaAspirante: aspirante.parroquiaAspirante || '',
            telefonoAspirante: aspirante.telefonoAspirante || '',
            correoAspirante: aspirante.correoAspirante || '',
            profesionAspirante: aspirante.profesionAspirante || '',
            fechaPostulacion: new Date(aspirante.fechaPostulacion).toISOString().split('T')[0],
            estadoAspirante: aspirante.estadoAspirante,
        });
        // Cargar municipios y parroquias para el estado y municipio seleccionados
        if (aspirante.estadoDireccionAspirante) {
            setMunicipios(getMunicipiosByEstado(aspirante.estadoDireccionAspirante));
            if (aspirante.municipioAspirante) {
                setParroquias(getParroquiasByMunicipio(aspirante.estadoDireccionAspirante, aspirante.municipioAspirante));
            }
        }
        setIsModalOpen(true);
    };

    const handleEstadoChange = (estadoId: string) => {
        setFormData({ ...formData, estadoDireccionAspirante: estadoId, municipioAspirante: '', parroquiaAspirante: '' });
        setMunicipios(getMunicipiosByEstado(estadoId));
        setParroquias([]);
    };

    const handleMunicipioChange = (municipioId: string) => {
        setFormData({ ...formData, municipioAspirante: municipioId, parroquiaAspirante: '' });
        setParroquias(getParroquiasByMunicipio(formData.estadoDireccionAspirante, municipioId));
    };

    const handleParroquiaChange = (parroquiaId: string) => {
        setFormData({ ...formData, parroquiaAspirante: parroquiaId });
    };

    const handleDelete = async (cedula: string) => {
        if (confirm('¿Está seguro de eliminar esta postulación?')) {
            const res = await deleteAspirante(cedula);
            if (res.success) {
                toast.success('Eliminado correctamente');
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
            const dataToSave = {
                ...formData,
                fechaNacimiento: new Date(formData.fechaNacimiento),
                fechaPostulacion: new Date(formData.fechaPostulacion),
            };

            const res = editingAspirante 
                ? await updateAspirante(editingAspirante.cedulaAspirante, dataToSave)
                : await createAspirante(dataToSave);

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error('Error inesperado al guardar');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<Aspirante>[] = [
        { key: 'cedulaAspirante', label: 'Cédula', sortable: true },
        { 
            key: 'nombreAspirante', 
            label: 'Aspirante', 
            render: (asp) => `${asp.nombreAspirante} ${asp.apellidoAspirante}`,
            sortable: true 
        },
        { key: 'profesionAspirante', label: 'Profesión', sortable: true },
        { 
            key: 'direccionCompleta',
            label: 'Dirección',
            render: (asp) => {
                const estadoNombre = getEstadoNombre(asp.estadoDireccionAspirante);
                const municipioNombre = getMunicipioNombre(asp.estadoDireccionAspirante, asp.municipioAspirante);
                const parroquiaNombre = getParroquiaNombre(asp.estadoDireccionAspirante, asp.municipioAspirante, asp.parroquiaAspirante);
                
                return (
                    <div className="text-sm">
                        <div>{asp.direccionAspirante}</div>
                        <div className="text-gray-600">
                            {parroquiaNombre}, {municipioNombre}, {estadoNombre}
                        </div>
                    </div>
                );
            },
        },
        { 
            key: 'telefonoAspirante',
            label: 'Teléfono',
            render: (asp) => (
                <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{asp.telefonoAspirante}</span>
                </div>
            ),
        },
        { 
            key: 'estadoAspirante', 
            label: 'Estado', 
            render: (asp) => (
                <Badge variant={asp.estadoAspirante === 'Pendiente' ? 'outline' : 'default'}>
                    {asp.estadoAspirante}
                </Badge>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (asp) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(asp)} disabled={!!isPromoting}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(asp.cedulaAspirante)} disabled={!!isPromoting}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                    <Button 
                        variant="ghost" size="sm" 
                        title="Aprobar como Tejedor"
                        onClick={() => handlePromote(asp)}
                        disabled={isPromoting === asp.cedulaAspirante}
                    >
                        {isPromoting === asp.cedulaAspirante ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <UserPlus className="w-4 h-4 text-green-600" />}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Aspirantes</h1>
                    <p className="text-gray-600">Lista de espera y postulaciones para nuevos tejedores</p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por cédula o nombre..."
                    onAdd={handleAdd}
                    addLabel="Nueva Postulación"
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Clipboard className="w-6 h-6 text-blue-600" />
                                {editingAspirante ? 'Editar Aspirante' : 'Registrar Aspirante'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* DATOS PERSONALES */}
                                <div className="space-y-2">
                                    <Label htmlFor="cedula">Cédula *</Label>
                                    <Input id="cedula" value={formData.cedulaAspirante} onChange={(e) => setFormData({ ...formData, cedulaAspirante: e.target.value })} required disabled={!!editingAspirante} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input id="nombre" value={formData.nombreAspirante} onChange={(e) => setFormData({ ...formData, nombreAspirante: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input id="apellido" value={formData.apellidoAspirante} onChange={(e) => setFormData({ ...formData, apellidoAspirante: e.target.value })} required />
                                </div>

                                {/* FECHAS */}
                                <div className="space-y-2">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                                    <Input id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaPostulacion">Fecha Postulación *</Label>
                                    <Input id="fechaPostulacion" type="date" value={formData.fechaPostulacion} onChange={(e) => setFormData({ ...formData, fechaPostulacion: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="profesion">Profesión *</Label>
                                    <Input id="profesion" value={formData.profesionAspirante} onChange={(e) => setFormData({ ...formData, profesionAspirante: e.target.value })} required />
                                </div>

                                {/* CONTACTO */}
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input id="telefono" value={formData.telefonoAspirante} onChange={(e) => setFormData({ ...formData, telefonoAspirante: e.target.value })} required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="correo">Correo Electrónico</Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={formData.correoAspirante}
                                        onChange={(e) => setFormData({ ...formData, correoAspirante: e.target.value })}
                                    />
                                </div>

                                {/* DIRECCIÓN */}
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="direccion">Dirección de Habitación</Label>
                                    <Input
                                        id="direccion"
                                        value={formData.direccionAspirante}
                                        onChange={(e) => setFormData({ ...formData, direccionAspirante: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Select
                                        value={formData.estadoDireccionAspirante}
                                        onValueChange={handleEstadoChange}
                                    >
                                        <SelectTrigger id="estado" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                            <SelectValue placeholder="Seleccione un estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estados.map((estado) => (
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
                                        value={formData.municipioAspirante}
                                        onValueChange={handleMunicipioChange}
                                        disabled={!formData.estadoDireccionAspirante}
                                    >
                                        <SelectTrigger
                                            id="municipio"
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    formData.estadoDireccionAspirante
                                                        ? "Seleccione un municipio"
                                                        : "Seleccione primero el estado"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {municipios.map((municipio) => (
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
                                        value={formData.parroquiaAspirante}
                                        onValueChange={handleParroquiaChange}
                                        disabled={!formData.municipioAspirante}
                                    >
                                        <SelectTrigger
                                            id="parroquia"
                                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    formData.municipioAspirante
                                                        ? "Seleccione una parroquia"
                                                        : "Seleccione primero el municipio"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {parroquias.map((parroquia) => (
                                                <SelectItem key={parroquia.id} value={parroquia.id}>
                                                    {parroquia.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="px-8 bg-blue-600" disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar Postulación'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}