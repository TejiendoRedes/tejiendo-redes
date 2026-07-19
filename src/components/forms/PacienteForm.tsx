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
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Comunidad } from '@/db/schema/comunidades';
import { Paciente } from '@/db/schema/pacientes';

export interface PacienteFormProps {
    initialData?: Paciente & { comunidad?: Comunidad | null };
    comunidades: Comunidad[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function PacienteForm({
    initialData,
    comunidades,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: PacienteFormProps) {
    const [formData, setFormData] = React.useState({
        cedulaPaciente: initialData?.cedulaPaciente || '',
        nombrePaciente: initialData?.nombrePaciente || '',
        apellidoPaciente: initialData?.apellidoPaciente || '',
        sexo: (initialData?.sexo as 'M' | 'F') || 'M',
        fechaNacimiento: initialData?.fechaNacimiento
            ? formattedDate(initialData.fechaNacimiento)
            : '',
        codigoComunidad: initialData?.codigoComunidad || '',
        direccionPaciente: initialData?.direccionPaciente || '',
        telefonoPaciente: initialData?.telefonoPaciente || '',
        correoPaciente: initialData?.correoPaciente || '',
    });

    // Helper to format date safely
    function formattedDate(date: Date | string | null): string {
        if (!date) return '';
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return date;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            fechaNacimiento: new Date(formData.fechaNacimiento)
        };
        await onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="cedula"
                        value={formData.cedulaPaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, cedulaPaciente: e.target.value })
                        }
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
                        value={formData.nombrePaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, nombrePaciente: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="apellido"
                        value={formData.apellidoPaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, apellidoPaciente: e.target.value })
                        }
                        required
                        maxLength={50}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={formData.sexo}
                        onValueChange={(value: 'M' | 'F') =>
                            setFormData({ ...formData, sexo: value })
                        }
                    >
                        <SelectTrigger id="sexo" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccione sexo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="text-red-500 font-bold">*</span></Label>
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

                <div className="space-y-4">
                    <SearchableSelect
                        label="Comunidad *"
                        items={comunidades}
                        value={formData.codigoComunidad}
                        onValueChange={(value) =>
                            setFormData({ ...formData, codigoComunidad: value })
                        }
                        placeholder="Seleccione comunidad"
                        searchPlaceholder="Buscar por nombre o municipio..."
                        idField="codigoComunidad"
                        labelField="nombreComunidad"
                        secondaryLabelField="municipio"
                        id="comunidad-select"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoPaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, telefonoPaciente: e.target.value })
                        }
                        required
                        maxLength={15}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correo">Correo Electrónico <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="correo"
                        type="email"
                        value={formData.correoPaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, correoPaciente: e.target.value })
                        }
                        required
                        maxLength={100}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>



                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="direccion">Dirección <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="direccion"
                        value={formData.direccionPaciente}
                        onChange={(e) =>
                            setFormData({ ...formData, direccionPaciente: e.target.value })
                        }
                        required
                        maxLength={150}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
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
                    className="px-8 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Actualizar Paciente' : 'Guardar Paciente'))}
                </Button>
            </div>
        </form>
    );
}
