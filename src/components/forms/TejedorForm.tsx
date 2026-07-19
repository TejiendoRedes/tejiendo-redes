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
import { getEstadosAction, getMunicipiosByEstadoAction, getParroquiasByMunicipioAction, getLocationHierarchy } from '@/queries/geografia';
import { Tejedor } from '@/db/schema/tejedores';

const PROFESIONES_PREDEFINIDAS = [
    "Médico",
    "Enfermero/a",
    "Trabajador/a Social",
    "Psicólogo/a",
    "Docente",
    "Abogado/a",
    "Ingeniero/a",
    "Administrador/a"
];

export interface TejedorFormProps {
    initialData?: Tejedor & { systemRole?: string | null };
    especialidades?: any[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isAdmin?: boolean;
    submitLabel?: string;
}

export function TejedorForm({
    initialData,
    onSubmit,
    onCancel,
    especialidades = [],
    isLoading = false,
    isAdmin = false,
    submitLabel
}: TejedorFormProps) {
    // Initial form state
    const initialCedulaParts = initialData?.cedulaTejedor?.match(/^([VPE])-(.+)$/);
    const initialTipoCedula = initialCedulaParts ? initialCedulaParts[1] : 'V';
    const initialNumeroCedula = initialCedulaParts ? initialCedulaParts[2] : (initialData?.cedulaTejedor || '');

    const initialProfesion = initialData?.profesionTejedor || '';
    const isPredefinida = initialProfesion === '' || PROFESIONES_PREDEFINIDAS.includes(initialProfesion);

    const initialFormState = {
        tipoCedula: initialTipoCedula,
        cedulaTejedor: initialNumeroCedula,
        nombreTejedor: initialData?.nombreTejedor || '',
        apellidoTejedor: initialData?.apellidoTejedor || '',
        fechaNacimiento: initialData?.fechaNacimiento
            ? formattedDate(initialData.fechaNacimiento)
            : '',
        direccionTejedor: initialData?.direccionTejedor || '',
        municipioTejedor: '',
        estadoTejedor: '',
        parroquiaId: initialData?.parroquiaId || 0,
        telefonoTejedor: initialData?.telefonoTejedor || '',
        correoTejedor: initialData?.correoTejedor || '',
        profesionSelect: isPredefinida ? (initialProfesion || '') : 'Otros',
        profesionOtra: isPredefinida ? '' : initialProfesion,
        fechaIngreso: initialData?.fechaIngreso
            ? formattedDate(initialData.fechaIngreso)
            : '',
        tipodeVoluntario: initialData?.tipodeVoluntario || '',
        systemRole: initialData?.systemRole || '',
        matriculaColegioMedico: (initialData as any)?.matriculaColegioMedico || '',
        matriculaSanidad: (initialData as any)?.matriculaSanidad || '',
        codigoEspecialidad: (initialData as any)?.codigoEspecialidad || '',
    };

    const [formData, setFormData] = React.useState(initialFormState);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const [estados, setEstados] = React.useState<any[]>([]);
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);
    const [isLoadingGeografia, setIsLoadingGeografia] = React.useState(true);

    React.useEffect(() => {
        const fetchInitialGeografia = async () => {
            setIsLoadingGeografia(true);
            const estadosRes = await getEstadosAction();
            if (estadosRes.success) setEstados(estadosRes.data);

            if (formData.parroquiaId) {
                const hierarchyRes = await getLocationHierarchy(formData.parroquiaId);
                if (hierarchyRes.success && hierarchyRes.data) {
                    const { estadoId, municipioId } = hierarchyRes.data;
                    setFormData(prev => ({ ...prev, estadoTejedor: estadoId.toString(), municipioTejedor: municipioId.toString() }));
                    const munRes = await getMunicipiosByEstadoAction(estadoId);
                    if (munRes.success) setMunicipios(munRes.data);
                    const parrRes = await getParroquiasByMunicipioAction(municipioId);
                    if (parrRes.success) setParroquias(parrRes.data);
                }
            }
            setIsLoadingGeografia(false);
        };
        fetchInitialGeografia();
    }, [formData.parroquiaId]);

    function formattedDate(date: Date | string): string {
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return date;
    }

    const handleEstadoChange = async (estadoIdStr: string) => {
        const estadoId = parseInt(estadoIdStr, 10);
        setFormData({ ...formData, estadoTejedor: estadoIdStr, municipioTejedor: '', parroquiaId: 0 });
        const res = await getMunicipiosByEstadoAction(estadoId);
        if (res.success) setMunicipios(res.data);
        setParroquias([]);
    };

    const handleMunicipioChange = async (municipioIdStr: string) => {
        const municipioId = parseInt(municipioIdStr, 10);
        setFormData({ ...formData, municipioTejedor: municipioIdStr, parroquiaId: 0 });
        const res = await getParroquiasByMunicipioAction(municipioId);
        if (res.success) setParroquias(res.data);
    };

    const handleParroquiaChange = (parroquiaIdStr: string) => {
        const parroquiaId = parseInt(parroquiaIdStr, 10);
        setFormData({ ...formData, parroquiaId: parroquiaId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        const finalProfesion = formData.profesionSelect === 'Otros' ? formData.profesionOtra : formData.profesionSelect;

        if (!finalProfesion || !finalProfesion.trim()) {
            newErrors.profesionTejedor = "La profesión es requerida";
        }

        if (formData.cedulaTejedor && !/^\d+$/.test(formData.cedulaTejedor)) {
            newErrors.cedulaTejedor = "El número de cédula debe contener solo números";
        }

        if (formData.nombreTejedor && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombreTejedor)) {
            newErrors.nombreTejedor = "El nombre debe contener solo letras";
        }

        if (formData.apellidoTejedor && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidoTejedor)) {
            newErrors.apellidoTejedor = "El apellido debe contener solo letras";
        }

        if (formData.telefonoTejedor && !/^[\d\+\-\s]+$/.test(formData.telefonoTejedor)) {
            newErrors.telefonoTejedor = "El teléfono debe contener solo números, + o -";
        }

        if (formData.correoTejedor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoTejedor)) {
            newErrors.correoTejedor = "El correo electrónico no tiene un formato válido";
        }

        if (finalProfesion === 'Médico') {
            if (!formData.codigoEspecialidad) {
                newErrors.codigoEspecialidad = "La especialidad es requerida";
            }
            if (!formData.matriculaColegioMedico?.trim()) {
                newErrors.matriculaColegioMedico = "La matrícula del Colegio Médico es requerida";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const { tipoCedula, profesionSelect, profesionOtra, ...restFormData } = formData;

        const dataToSave: any = {
            ...restFormData,
            cedulaTejedor: `${tipoCedula}-${formData.cedulaTejedor}`,
            profesionTejedor: finalProfesion,
            fechaNacimiento: new Date(formData.fechaNacimiento),
            fechaIngreso: new Date(formData.fechaIngreso),
        };
        await onSubmit(dataToSave);
    };

    const todayDate = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cedula" className={errors.cedulaTejedor ? "text-red-500" : ""}>Cédula <span className="text-red-500 font-bold">*</span></Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.tipoCedula}
                            onValueChange={(val) => setFormData({ ...formData, tipoCedula: val })}
                            disabled={!!initialData}
                        >
                            <SelectTrigger className="w-[65px] h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                                <SelectItem value="P">P</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            id="cedula"
                            value={formData.cedulaTejedor}
                            onChange={(e) => {
                                setFormData({ ...formData, cedulaTejedor: e.target.value });
                                if (errors.cedulaTejedor) setErrors({ ...errors, cedulaTejedor: '' });
                            }}
                            required
                            disabled={!!initialData}
                            maxLength={12}
                            placeholder="Ej: 12345678"
                            onFocus={(e) => e.target.placeholder = ""}
                            onBlur={(e) => e.target.placeholder = "Ej: 12345678"}
                            className={`flex-1 h-11 shadow-sm focus:ring-blue-500 ${errors.cedulaTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                        />
                    </div>
                    {errors.cedulaTejedor && <p className="text-red-500 text-sm mt-1">{errors.cedulaTejedor}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nombre" className={errors.nombreTejedor ? "text-red-500" : ""}>Nombre <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="nombre"
                        value={formData.nombreTejedor}
                        onChange={(e) => {
                            setFormData({ ...formData, nombreTejedor: e.target.value });
                            if (errors.nombreTejedor) setErrors({ ...errors, nombreTejedor: '' });
                        }}
                        required
                        maxLength={50}
                        placeholder="Ej: Juan"
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = "Ej: Juan"}
                        className={`h-11 shadow-sm focus:ring-blue-500 ${errors.nombreTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                    {errors.nombreTejedor && <p className="text-red-500 text-sm mt-1">{errors.nombreTejedor}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apellido" className={errors.apellidoTejedor ? "text-red-500" : ""}>Apellido <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="apellido"
                        value={formData.apellidoTejedor}
                        onChange={(e) => {
                            setFormData({ ...formData, apellidoTejedor: e.target.value });
                            if (errors.apellidoTejedor) setErrors({ ...errors, apellidoTejedor: '' });
                        }}
                        required
                        maxLength={50}
                        placeholder="Ej: Pérez"
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = "Ej: Pérez"}
                        className={`h-11 shadow-sm focus:ring-blue-500 ${errors.apellidoTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                    {errors.apellidoTejedor && <p className="text-red-500 text-sm mt-1">{errors.apellidoTejedor}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="fechaNacimiento"
                        type="date"
                        max={todayDate}
                        value={formData.fechaNacimiento}
                        onChange={(e) =>
                            setFormData({ ...formData, fechaNacimiento: e.target.value })
                        }
                        required
                        className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="profesion" className={errors.profesionTejedor ? "text-red-500" : ""}>Profesión <span className="text-red-500 font-bold">*</span></Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.profesionSelect}
                            onValueChange={(val) => setFormData({ ...formData, profesionSelect: val })}
                            required
                        >
                            <SelectTrigger className={`h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${formData.profesionSelect === 'Otros' ? 'w-1/2' : 'w-full'}`}>
                                <SelectValue placeholder="Seleccione una profesión" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROFESIONES_PREDEFINIDAS.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                                <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                        {formData.profesionSelect === 'Otros' && (
                            <Input
                                placeholder="Especifique..."
                                value={formData.profesionOtra}
                                onChange={(e) => {
                                    setFormData({ ...formData, profesionOtra: e.target.value });
                                    if (errors.profesionTejedor) setErrors({ ...errors, profesionTejedor: '' });
                                }}
                                required={formData.profesionSelect === 'Otros'}
                                maxLength={50}
                                className={`flex-1 h-11 shadow-sm focus:ring-blue-500 ${errors.profesionTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            />
                        )}
                    </div>
                    {errors.profesionTejedor && <p className="text-red-500 text-sm mt-1">{errors.profesionTejedor}</p>}
                </div>

                {formData.profesionSelect === 'Médico' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="especialidad" className={errors.codigoEspecialidad ? "text-red-500" : ""}>Especialidad <span className="text-red-500 font-bold">*</span></Label>
                            <Select
                                value={formData.codigoEspecialidad}
                                onValueChange={(val) => setFormData({ ...formData, codigoEspecialidad: val })}
                            >
                                <SelectTrigger className={`h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.codigoEspecialidad ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Seleccione especialidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    {especialidades.map(e => (
                                        <SelectItem key={e.codigoEspecialidad} value={e.codigoEspecialidad}>{e.nombreEspecialidad}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.codigoEspecialidad && <p className="text-red-500 text-sm mt-1">{errors.codigoEspecialidad}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="matriculaColegio" className={errors.matriculaColegioMedico ? "text-red-500" : ""}>Matrícula C.M. <span className="text-red-500 font-bold">*</span></Label>
                            <Input
                                id="matriculaColegio"
                                value={formData.matriculaColegioMedico}
                                onChange={(e) => {
                                    setFormData({ ...formData, matriculaColegioMedico: e.target.value });
                                    if (errors.matriculaColegioMedico) setErrors({ ...errors, matriculaColegioMedico: '' });
                                }}
                                required
                                maxLength={30}
                                placeholder="Ej: 12345"
                                className={`h-11 shadow-sm focus:ring-blue-500 ${errors.matriculaColegioMedico ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            />
                            {errors.matriculaColegioMedico && <p className="text-red-500 text-sm mt-1">{errors.matriculaColegioMedico}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="matriculaSanidad">Matrícula Sanidad (Opcional)</Label>
                            <Input
                                id="matriculaSanidad"
                                value={formData.matriculaSanidad}
                                onChange={(e) => setFormData({ ...formData, matriculaSanidad: e.target.value })}
                                maxLength={30}
                                placeholder="Ej: 12345"
                                className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <Label htmlFor="tipoVoluntario">Tipo Voluntario <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={formData.tipodeVoluntario}
                        onValueChange={(val) => setFormData({ ...formData, tipodeVoluntario: val })}
                        required
                    >
                        <SelectTrigger className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Médico">Médico</SelectItem>
                            <SelectItem value="Cocinero">Cocinero</SelectItem>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                            <SelectItem value="Trabajador Social">Trabajador Social</SelectItem>
                            <SelectItem value="Psicólogo">Psicólogo</SelectItem>
                            <SelectItem value="Logística">Logística</SelectItem>
                            <SelectItem value="Seguridad">Seguridad</SelectItem>
                            <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                            <SelectItem value="Enfermería">Enfermería</SelectItem>
                            <SelectItem value="Odontología">Odontología</SelectItem>
                            <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isAdmin && (
                    <div className="space-y-2">
                        <Label htmlFor="systemRole" className="text-blue-700">Rol del Sistema (Acceso)</Label>
                        <Select
                            value={formData.systemRole}
                            onValueChange={(val) => setFormData({ ...formData, systemRole: val })}
                        >
                            <SelectTrigger className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-blue-50/50">
                                <SelectValue placeholder="Seleccione acceso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tejedor">Voluntario Básico</SelectItem>
                                <SelectItem value="medico">Médico (Atención Médica)</SelectItem>
                                <SelectItem value="operador">Operador (Farmacia / Datos)</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="superuser">Superusuario</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="fechaIngreso">Fecha de Ingreso <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="fechaIngreso"
                        type="date"
                        value={formData.fechaIngreso}
                        onChange={(e) =>
                            setFormData({ ...formData, fechaIngreso: e.target.value })
                        }
                        required
                        className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono" className={errors.telefonoTejedor ? "text-red-500" : ""}>Teléfono <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoTejedor}
                        onChange={(e) => {
                            setFormData({ ...formData, telefonoTejedor: e.target.value });
                            if (errors.telefonoTejedor) setErrors({ ...errors, telefonoTejedor: '' });
                        }}
                        required
                        maxLength={15}
                        placeholder="Ej: 04141234567"
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = "Ej: 04141234567"}
                        className={`h-11 shadow-sm focus:ring-blue-500 ${errors.telefonoTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                    {errors.telefonoTejedor && <p className="text-red-500 text-sm mt-1">{errors.telefonoTejedor}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="correo" className={errors.correoTejedor ? "text-red-500" : ""}>Correo Electrónico <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="correo"
                        type="email"
                        value={formData.correoTejedor}
                        onChange={(e) => {
                            setFormData({ ...formData, correoTejedor: e.target.value });
                            if (errors.correoTejedor) setErrors({ ...errors, correoTejedor: '' });
                        }}
                        required
                        maxLength={100}
                        placeholder="Ej: juan.perez@example.com"
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = "Ej: juan.perez@example.com"}
                        className={`h-11 shadow-sm focus:ring-blue-500 ${errors.correoTejedor ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                    />
                    {errors.correoTejedor && <p className="text-red-500 text-sm mt-1">{errors.correoTejedor}</p>}
                </div>

                <div className="col-span-full space-y-2">
                    <Label htmlFor="direccion">Dirección <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="direccion"
                        value={formData.direccionTejedor}
                        onChange={(e) =>
                            setFormData({ ...formData, direccionTejedor: e.target.value })
                        }
                        required
                        maxLength={150}
                        placeholder="Ej: Calle Principal, etc, etc. "
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = "Ej: Calle Principal, etc, etc. "}
                        className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estado">Estado <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={formData.estadoTejedor}
                        onValueChange={handleEstadoChange}
                        disabled={isLoadingGeografia}
                    >
                        <SelectTrigger id="estado" className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                            {estados.map(estado => (
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
                        value={formData.municipioTejedor}
                        onValueChange={handleMunicipioChange}
                        disabled={!formData.estadoTejedor || isLoadingGeografia}
                    >
                        <SelectTrigger id="municipio" className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={formData.estadoTejedor ? "Seleccione un municipio" : "Seleccione primero el estado"} />
                        </SelectTrigger>
                        <SelectContent>
                            {municipios.map(municipio => (
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
                        value={formData.parroquiaId ? formData.parroquiaId.toString() : ''}
                        onValueChange={handleParroquiaChange}
                        disabled={!formData.municipioTejedor || isLoadingGeografia}
                    >
                        <SelectTrigger id="parroquia" className="h-11 shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={formData.municipioTejedor ? "Seleccione una parroquia" : "Seleccione primero el municipio"} />
                        </SelectTrigger>
                        <SelectContent>
                            {parroquias.map(parroquia => (
                                <SelectItem key={parroquia.id} value={parroquia.id.toString()}>
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
