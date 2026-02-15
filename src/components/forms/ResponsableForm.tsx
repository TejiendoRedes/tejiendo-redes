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
import { Responsable } from '@/db/schema/responsable';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';
import { User, Briefcase, Phone, Mail, MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export interface ResponsableFormProps {
    initialData?: Responsable;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function ResponsableForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: ResponsableFormProps) {
    const [formData, setFormData] = useState({
        cedulaResponsable: initialData?.cedulaResponsable || '',
        nombreResponsable: initialData?.nombreResponsable || '',
        apellidoResponsable: initialData?.apellidoResponsable || '',
        direccionResponsable: initialData?.direccionResponsable || '',
        telefonoResponsable: initialData?.telefonoResponsable || '',
        correoResponsable: initialData?.correoResponsable || '',
        cargo: initialData?.cargo || '',
        estado: (initialData as any)?.estado || '',
        municipio: (initialData as any)?.municipio || '',
        parroquia: (initialData as any)?.parroquia || '',
    });

    const [municipios, setMunicipios] = useState<any[]>([]);
    const [parroquias, setParroquias] = useState<any[]>([]);
    const estados = getEstados();

    useEffect(() => {
        if (formData.estado) {
            setMunicipios(getMunicipiosByEstado(formData.estado));
            if (formData.municipio) {
                setParroquias(getParroquiasByMunicipio(formData.estado, formData.municipio));
            }
        }
    }, [formData.estado, formData.municipio]); // Initialize dependent dropdowns

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
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="cedula" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Cédula *
                    </Label>
                    <Input
                        id="cedula"
                        value={formData.cedulaResponsable}
                        onChange={(e) => setFormData({ ...formData, cedulaResponsable: e.target.value })}
                        required
                        disabled={!!initialData}
                        maxLength={12}
                        placeholder="Ej. 12345678"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cargo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        Cargo *
                    </Label>
                    <Input
                        id="cargo"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        required
                        maxLength={50}
                        placeholder="Ej. Presidente de JAC"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombres *</Label>
                    <Input
                        id="nombre"
                        value={formData.nombreResponsable}
                        onChange={(e) => setFormData({ ...formData, nombreResponsable: e.target.value })}
                        required
                        maxLength={50}
                        placeholder="Ej. María Josefa"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apellido" className="text-sm font-semibold text-gray-700">Apellidos *</Label>
                    <Input
                        id="apellido"
                        value={formData.apellidoResponsable}
                        onChange={(e) => setFormData({ ...formData, apellidoResponsable: e.target.value })}
                        required
                        maxLength={50}
                        placeholder="Ej. Pérez García"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        Teléfono *
                    </Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoResponsable}
                        onChange={(e) => setFormData({ ...formData, telefonoResponsable: e.target.value })}
                        required
                        maxLength={15}
                        placeholder="Ej. 0424-1234567"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        Correo Electrónico *
                    </Label>
                    <Input
                        id="correo"
                        type="email"
                        value={formData.correoResponsable}
                        onChange={(e) => setFormData({ ...formData, correoResponsable: e.target.value })}
                        required
                        maxLength={100}
                        placeholder="correo@ejemplo.com"
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="estado" className="text-sm font-semibold text-gray-700">Estado *</Label>
                        <Select
                            value={formData.estado}
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger id="estado" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg">
                                <SelectValue placeholder="Estado" />
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
                        <Label htmlFor="municipio" className="text-sm font-semibold text-gray-700">Municipio *</Label>
                        <Select
                            value={formData.municipio}
                            onValueChange={handleMunicipioChange}
                            disabled={!formData.estado}
                        >
                            <SelectTrigger id="municipio" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg">
                                <SelectValue placeholder={formData.estado ? "Municipio" : "Primero estado"} />
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
                        <Label htmlFor="parroquia" className="text-sm font-semibold text-gray-700">Parroquia *</Label>
                        <Select
                            value={formData.parroquia}
                            onValueChange={handleParroquiaChange}
                            disabled={!formData.municipio}
                        >
                            <SelectTrigger id="parroquia" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg">
                                <SelectValue placeholder={formData.municipio ? "Parroquia" : "Primero municipio"} />
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

                <div className="col-span-full space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Dirección de Habitación *
                    </Label>
                    <Input
                        id="direccion"
                        value={formData.direccionResponsable}
                        onChange={(e) => setFormData({ ...formData, direccionResponsable: e.target.value })}
                        required
                        maxLength={150}
                        placeholder="Ej. Calle Principal, Casa nro 123..."
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all rounded-lg"
                    />
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-100 transition-all active:scale-95"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {initialData ? 'Guardando...' : 'Registrando...'}
                        </>
                    ) : (
                        submitLabel || (initialData ? 'Actualizar Datos' : 'Registrar Responsable')
                    )}
                </Button>
            </div>
        </form>
    );

    // Added a small helper to handle "editingResponsable" variable used inside button label check
    // Actually "editingResponsable" is not in scope here, it should be "initialData". 
    // And "Registrando..." string
}
