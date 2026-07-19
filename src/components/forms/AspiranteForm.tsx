'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Aspirante, NewAspirante } from '@/db/schema/aspirantes';
import { getEstadosAction, getMunicipiosByEstadoAction, getParroquiasByMunicipioAction } from '@/queries/geografia';
import { Loader2 } from 'lucide-react';

interface AspiranteFormData extends Omit<NewAspirante, 'fechaNacimiento' | 'fechaPostulacion'> {
    fechaNacimiento: string;
    fechaPostulacion: string;
}

interface LocationItem {
    id: number;
    nombre: string;
}

export interface AspiranteFormProps {
    initialData?: Aspirante;
    onSubmit: (data: AspiranteFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function AspiranteForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: AspiranteFormProps) {
    const [formData, setFormData] = useState<AspiranteFormData>({
        cedulaAspirante: initialData?.cedulaAspirante || '',
        nombreAspirante: initialData?.nombreAspirante || '',
        apellidoAspirante: initialData?.apellidoAspirante || '',
        fechaNacimiento: initialData?.fechaNacimiento ? new Date(initialData.fechaNacimiento).toISOString().split('T')[0] : '',
        direccionAspirante: initialData?.direccionAspirante || '',
        parroquiaId: initialData?.parroquiaId || 0,
        telefonoAspirante: initialData?.telefonoAspirante || '',
        correoAspirante: initialData?.correoAspirante || '',
        profesionAspirante: initialData?.profesionAspirante || '',
        fechaPostulacion: initialData?.fechaPostulacion ? new Date(initialData.fechaPostulacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estadoAspirante: initialData?.estadoAspirante || 'Pendiente',
    });

    const [estados, setEstados] = useState<LocationItem[]>([]);
    const [municipios, setMunicipios] = useState<LocationItem[]>([]);
    const [parroquias, setParroquias] = useState<LocationItem[]>([]);
    const [selectedEstado, setSelectedEstado] = useState<string>('');
    const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');

    useEffect(() => {
        const fetchEstados = async () => {
            const res = await getEstadosAction();
            if (res.success && res.data) {
                setEstados(res.data);
            }
        };
        fetchEstados();
    }, []);

    const handleEstadoChange = async (estadoIdStr: string) => {
        const estadoId = parseInt(estadoIdStr, 10);
        setSelectedEstado(estadoIdStr);
        setSelectedMunicipio('');
        setFormData(prev => ({ ...prev, parroquiaId: 0 }));
        
        const res = await getMunicipiosByEstadoAction(estadoId);
        if (res.success && res.data) {
            setMunicipios(res.data);
        }
        setParroquias([]);
    };

    const handleMunicipioChange = async (municipioIdStr: string) => {
        const municipioId = parseInt(municipioIdStr, 10);
        setSelectedMunicipio(municipioIdStr);
        setFormData(prev => ({ ...prev, parroquiaId: 0 }));

        const res = await getParroquiasByMunicipioAction(municipioId);
        if (res.success && res.data) {
            setParroquias(res.data);
        }
    };

    const handleParroquiaChange = (parroquiaIdStr: string) => {
        setFormData(prev => ({
            ...prev,
            parroquiaId: parseInt(parroquiaIdStr, 10)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DATOS PERSONALES */}
                <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="cedula"
                        value={formData.cedulaAspirante}
                        onChange={(e) => setFormData({ ...formData, cedulaAspirante: e.target.value })}
                        required
                        disabled={!!initialData}
                        maxLength={12}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="nombre"
                        value={formData.nombreAspirante}
                        onChange={(e) => setFormData({ ...formData, nombreAspirante: e.target.value })}
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="apellido"
                        value={formData.apellidoAspirante}
                        onChange={(e) => setFormData({ ...formData, apellidoAspirante: e.target.value })}
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* FECHAS */}
                <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                        required
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fechaPostulacion">Fecha Postulación <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="fechaPostulacion"
                        type="date"
                        value={formData.fechaPostulacion}
                        onChange={(e) => setFormData({ ...formData, fechaPostulacion: e.target.value })}
                        required
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="profesion">Profesión <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="profesion"
                        value={formData.profesionAspirante}
                        onChange={(e) => setFormData({ ...formData, profesionAspirante: e.target.value })}
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* CONTACTO */}
                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoAspirante}
                        onChange={(e) => setFormData({ ...formData, telefonoAspirante: e.target.value })}
                        required
                        maxLength={15}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input
                        id="correo"
                        type="email"
                        value={formData.correoAspirante}
                        onChange={(e) => setFormData({ ...formData, correoAspirante: e.target.value })}
                        maxLength={100}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* DIRECCIÓN */}
                <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="direccion">Dirección de Habitación</Label>
                    <Input
                        id="direccion"
                        value={formData.direccionAspirante}
                        onChange={(e) => setFormData({ ...formData, direccionAspirante: e.target.value })}
                        maxLength={150}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estado">Estado <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={selectedEstado}
                        onValueChange={handleEstadoChange}
                    >
                        <SelectTrigger id="estado" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {estados.map((estado) => (
                                <SelectItem key={estado.id} value={estado.id.toString()}>
                                    {estado.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={selectedMunicipio}
                        onValueChange={handleMunicipioChange}
                        disabled={!selectedEstado}
                    >
                        <SelectTrigger
                            id="municipio"
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <SelectValue
                                placeholder={
                                    selectedEstado
                                        ? "Seleccione un municipio"
                                        : "Seleccione primero el estado"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {municipios.map((municipio) => (
                                <SelectItem key={municipio.id} value={municipio.id.toString()}>
                                    {municipio.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parroquia">Parroquia <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={formData.parroquiaId > 0 ? formData.parroquiaId.toString() : ''}
                        onValueChange={handleParroquiaChange}
                        disabled={!selectedMunicipio}
                    >
                        <SelectTrigger
                            id="parroquia"
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <SelectValue
                                placeholder={
                                    selectedMunicipio
                                        ? "Seleccione una parroquia"
                                        : "Seleccione primero el municipio"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {parroquias.map((parroquia) => (
                                <SelectItem key={parroquia.id} value={parroquia.id.toString()}>
                                    {parroquia.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" className="px-8" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {initialData ? 'Guardando...' : 'Guardar Postulación'}
                        </>
                    ) : (
                        submitLabel || (initialData ? 'Actualizar Aspirante' : 'Guardar Aspirante')
                    )}
                </Button>
            </div>
        </form>
    );
}
