'use client';

import React from 'react';
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
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';
import { Tejedor } from '@/db/schema/tejedores';

export interface TejedorFormProps {
    initialData?: Tejedor;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function TejedorForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: TejedorFormProps) {
    // Initial form state
    const initialFormState = {
        cedulaTejedor: initialData?.cedulaTejedor || '',
        nombreTejedor: initialData?.nombreTejedor || '',
        apellidoTejedor: initialData?.apellidoTejedor || '',
        fechaNacimiento: initialData?.fechaNacimiento
            ? formattedDate(initialData.fechaNacimiento)
            : '',
        direccionTejedor: initialData?.direccionTejedor || '',
        municipioTejedor: initialData?.municipioTejedor || '',
        estadoTejedor: initialData?.estadoTejedor || '',
        parroquiaTejedor: initialData?.parroquiaTejedor || '',
        telefonoTejedor: initialData?.telefonoTejedor || '',
        correoTejedor: initialData?.correoTejedor || '',
        profesionTejedor: initialData?.profesionTejedor || '',
        fechaIngreso: initialData?.fechaIngreso
            ? formattedDate(initialData.fechaIngreso)
            : '',
        tipodeVoluntario: initialData?.tipodeVoluntario || '',
    };

    const [formData, setFormData] = React.useState(initialFormState);

    const [estados] = React.useState(getEstados());
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (formData.estadoTejedor) {
            setMunicipios(getMunicipiosByEstado(formData.estadoTejedor));
            if (formData.municipioTejedor) {
                setParroquias(getParroquiasByMunicipio(formData.estadoTejedor, formData.municipioTejedor));
            }
        }
    }, [formData.estadoTejedor, formData.municipioTejedor]);

    function formattedDate(date: Date | string): string {
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return date;
    }

    const handleEstadoChange = (estadoId: string) => {
        setFormData({ ...formData, estadoTejedor: estadoId, municipioTejedor: '', parroquiaTejedor: '' });
        setMunicipios(getMunicipiosByEstado(estadoId));
        setParroquias([]);
    };

    const handleMunicipioChange = (municipioId: string) => {
        setFormData({ ...formData, municipioTejedor: municipioId, parroquiaTejedor: '' });
        setParroquias(getParroquiasByMunicipio(formData.estadoTejedor, municipioId));
    };

    const handleParroquiaChange = (parroquiaId: string) => {
        setFormData({ ...formData, parroquiaTejedor: parroquiaId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            fechaNacimiento: new Date(formData.fechaNacimiento),
            fechaIngreso: new Date(formData.fechaIngreso),
        };
        await onSubmit(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula *</Label>
                    <Input
                        id="cedula"
                        value={formData.cedulaTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, cedulaTejedor: e.target.value })
                        }
                        required
                        disabled={!!initialData}
                        maxLength={12}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                        id="nombre"
                        value={formData.nombreTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, nombreTejedor: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                        id="apellido"
                        value={formData.apellidoTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, apellidoTejedor: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                    <Input
                        id="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) =>
                            setFormData({ ...formData, fechaNacimiento: e.target.value })
                        }
                        required
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="profesion">Profesión *</Label>
                    <Input
                        id="profesion"
                        value={formData.profesionTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, profesionTejedor: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tipoVoluntario">Tipo Voluntario *</Label>
                    <Input
                        id="tipoVoluntario"
                        value={formData.tipodeVoluntario}
                        onChange={(e) =>
                            setFormData({ ...formData, tipodeVoluntario: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                    <Input
                        id="fechaIngreso"
                        type="date"
                        value={formData.fechaIngreso}
                        onChange={(e) =>
                            setFormData({ ...formData, fechaIngreso: e.target.value })
                        }
                        required
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, telefonoTejedor: e.target.value })
                        }
                        required
                        maxLength={15}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                        id="correo"
                        type="email"
                        value={formData.correoTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, correoTejedor: e.target.value })
                        }
                        required
                        maxLength={100}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="col-span-full space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                        id="direccion"
                        value={formData.direccionTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, direccionTejedor: e.target.value })
                        }
                        required
                        maxLength={150}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                        value={formData.estadoTejedor}
                        onValueChange={handleEstadoChange}
                    >
                        <SelectTrigger id="estado" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccione un estado" />
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
                    <Label htmlFor="municipio">Municipio *</Label>
                    <Select
                        value={formData.municipioTejedor}
                        onValueChange={handleMunicipioChange}
                        disabled={!formData.estadoTejedor}
                    >
                        <SelectTrigger id="municipio" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={formData.estadoTejedor ? "Seleccione un municipio" : "Seleccione primero el estado"} />
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
                    <Label htmlFor="parroquia">Parroquia *</Label>
                    <Select
                        value={formData.parroquiaTejedor}
                        onValueChange={handleParroquiaChange}
                        disabled={!formData.municipioTejedor}
                    >
                        <SelectTrigger id="parroquia" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={formData.municipioTejedor ? "Seleccione una parroquia" : "Seleccione primero el municipio"} />
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

            <div className="flex gap-2 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95"
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Guardar Tejedor' : 'Guardar Tejedor'))}
                </Button>
            </div>
        </form>
    );
}
