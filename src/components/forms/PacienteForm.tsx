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
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';
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
    // Estados para selectores dependientes
    const estados = getEstados();
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    const [formData, setFormData] = React.useState({
        cedulaPaciente: initialData?.cedulaPaciente || '',
        nombrePaciente: initialData?.nombrePaciente || '',
        apellidoPaciente: initialData?.apellidoPaciente || '',
        sexo: (initialData?.sexo as 'M' | 'F') || 'M',
        fechaNacimiento: initialData?.fechaNacimiento
            ? formattedDate(initialData.fechaNacimiento)
            : '',
        codigoComunidad: initialData?.codigoComunidad || '',
        estado: (initialData as any)?.estado || '',
        municipio: (initialData as any)?.municipio || '',
        parroquia: (initialData as any)?.parroquia || '',
        direccionPaciente: initialData?.direccionPaciente || '',
        telefonoPaciente: initialData?.telefonoPaciente || '',
        correoPaciente: initialData?.correoPaciente || '',
        historialEnfermedades: initialData?.historialEnfermedades || '',
        consultasMedicasPrevias: initialData?.consultasMedicasPrevias || '',
        nota: initialData?.nota || '',
    });

    React.useEffect(() => {
        if (formData.estado) {
            setMunicipios(getMunicipiosByEstado(formData.estado));
            if (formData.municipio) {
                setParroquias(getParroquiasByMunicipio(formData.estado, formData.municipio));
            }
        }
    }, [formData.estado, formData.municipio]);

    // Helper to format date safely
    function formattedDate(date: Date | string | null): string {
        if (!date) return '';
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return date;
    }

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

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.estado}
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
                        <Label htmlFor="municipio">Municipio <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.municipio}
                            onValueChange={handleMunicipioChange}
                            disabled={!formData.estado}
                        >
                            <SelectTrigger id="municipio" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder={formData.estado ? "Seleccione un municipio" : "Seleccione primero el estado"} />
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
                        <Label htmlFor="parroquia">Parroquia <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.parroquia}
                            onValueChange={handleParroquiaChange}
                            disabled={!formData.municipio}
                        >
                            <SelectTrigger id="parroquia" className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder={formData.municipio ? "Seleccione una parroquia" : "Seleccione primero el municipio"} />
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

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="historialEnfermedades">Historial de Enfermedades</Label>
                    <Textarea
                        id="historialEnfermedades"
                        value={formData.historialEnfermedades}
                        onChange={(e) =>
                            setFormData({ ...formData, historialEnfermedades: e.target.value })
                        }
                        placeholder="Describa el historial de enfermedades del paciente..."
                        rows={3}
                    />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="consultasMedicasPrevias">Consultas Médicas Previas</Label>
                    <Textarea
                        id="consultasMedicasPrevias"
                        value={formData.consultasMedicasPrevias}
                        onChange={(e) =>
                            setFormData({ ...formData, consultasMedicasPrevias: e.target.value })
                        }
                        placeholder="Describa consultas o intervenciones previas..."
                        rows={3}
                    />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="nota">Notas / Observaciones</Label>
                    <Textarea
                        id="nota"
                        value={formData.nota}
                        onChange={(e) =>
                            setFormData({ ...formData, nota: e.target.value })
                        }
                        rows={3}
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
