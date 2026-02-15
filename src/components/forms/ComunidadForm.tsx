'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';
import { Comunidad } from '@/db/schema/comunidades';
import { Responsable } from '@/db/schema/responsable'; // Assuming exported type

export interface ComunidadFormProps {
    initialData?: Comunidad;
    responsables: Responsable[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function ComunidadForm({
    initialData,
    responsables,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: ComunidadFormProps) {
    const initialFormState = {
        codigoComunidad: initialData?.codigoComunidad || '',
        nombreComunidad: initialData?.nombreComunidad || '',
        tipoComunidad: initialData?.tipoComunidad || '',
        estado: initialData?.estado || '',
        municipio: initialData?.municipio || '',
        parroquia: initialData?.parroquia || '',
        direccion: initialData?.direccion || '',
        ubicacionFisica: initialData?.ubicacionFisica || '',
        cedulaResponsable: initialData?.cedulaResponsable || '',
        cantidadHabitantes: initialData?.cantidadHabitantes || 0,
        cantidadFamilias: initialData?.cantidadFamilias || 0,
        cantidadNinos: initialData?.cantidadNinos || 0,
        cantidadAdolescentes: initialData?.cantidadAdolescentes || 0,
        cantidadMayores: initialData?.cantidadMayores || 0,
        cantidadMayores60: initialData?.cantidadMayores60 || 0,
        telefonoComunidad: initialData?.telefonoComunidad || '',
        tieneTransporte: initialData?.tieneTransporte || false,
        tieneRefrigerios: initialData?.tieneRefrigerios || false,
        tieneAgua: initialData?.tieneAgua || false,
        tieneEspacioCubierto: initialData?.tieneEspacioCubierto || false,
        tieneMaterialEducativo: initialData?.tieneMaterialEducativo || false,
        notasLogistica: initialData?.notasLogistica || '',
    };

    const [formData, setFormData] = React.useState(initialFormState);
    const [estados] = React.useState(getEstados());
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (formData.estado) {
            setMunicipios(getMunicipiosByEstado(formData.estado));
            if (formData.municipio) {
                setParroquias(getParroquiasByMunicipio(formData.estado, formData.municipio));
            }
        }
    }, [formData.estado, formData.municipio]);

    const handleEstadoChange = (estadoId: string) => {
        setFormData({ ...formData, estado: estadoId, municipio: '', parroquia: '' });
        setMunicipios(getMunicipiosByEstado(estadoId));
        setParroquias([]);
    };

    const handleMunicipioChange = (municipioId: string) => {
        setFormData({ ...formData, municipio: municipioId, parroquia: '' });
        setParroquias(getParroquiasByMunicipio(formData.estado, municipioId));
    };

    const handleParroquiaChange = (parroquiaId: string) => {
        setFormData({ ...formData, parroquia: parroquiaId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Información Básica */}
                <div className="col-span-full">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Información Básica</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                        id="codigo"
                        value={formData.codigoComunidad}
                        disabled={true}
                        placeholder="Generado automáticamente"
                        className="bg-gray-100"
                    />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="nombre">Nombre de la Comunidad *</Label>
                    <Input
                        id="nombre"
                        value={formData.nombreComunidad}
                        onChange={(e) => setFormData({ ...formData, nombreComunidad: e.target.value })}
                        required
                        maxLength={150}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Comunidad *</Label>
                    <Select
                        value={formData.tipoComunidad}
                        onValueChange={(value) => setFormData({ ...formData, tipoComunidad: value })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Urbana</SelectItem>
                            <SelectItem value="2">Rural</SelectItem>
                            <SelectItem value="3">Indígena</SelectItem>
                            <SelectItem value="4">Base de Misiones</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="responsable">Responsable *</Label>
                    <Select
                        value={formData.cedulaResponsable}
                        onValueChange={(value) => setFormData({ ...formData, cedulaResponsable: value })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione responsable" />
                        </SelectTrigger>
                        <SelectContent>
                            {responsables.map((resp) => (
                                <SelectItem key={resp.cedulaResponsable} value={resp.cedulaResponsable}>
                                    {resp.nombreResponsable} {resp.apellidoResponsable}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                        id="telefono"
                        value={formData.telefonoComunidad}
                        onChange={(e) => setFormData({ ...formData, telefonoComunidad: e.target.value })}
                        required
                        maxLength={15}
                    />
                </div>

                {/* Ubicación */}
                <div className="col-span-full mt-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Ubicación</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select value={formData.estado} onValueChange={handleEstadoChange} required>
                        <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                        <SelectContent>
                            {estados.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio *</Label>
                    <Select value={formData.municipio} onValueChange={handleMunicipioChange} disabled={!formData.estado} required>
                        <SelectTrigger><SelectValue placeholder="Seleccione municipio" /></SelectTrigger>
                        <SelectContent>
                            {municipios.map(m => <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parroquia">Parroquia *</Label>
                    <Select value={formData.parroquia} onValueChange={handleParroquiaChange} disabled={!formData.municipio} required>
                        <SelectTrigger><SelectValue placeholder="Seleccione parroquia" /></SelectTrigger>
                        <SelectContent>
                            {parroquias.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 col-span-full">
                    <Label htmlFor="direccion">Dirección Exacta *</Label>
                    <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        required
                        maxLength={150}
                    />
                </div>

                <div className="space-y-2 col-span-full">
                    <Label htmlFor="ubicacionFisica">Ubicación Física / Punto de Referencia *</Label>
                    <Textarea
                        id="ubicacionFisica"
                        value={formData.ubicacionFisica}
                        onChange={(e) => setFormData({ ...formData, ubicacionFisica: e.target.value })}
                        required
                        className="min-h-[80px]"
                    />
                </div>

                {/* Datos Demográficos */}
                <div className="col-span-full mt-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Datos Demográficos</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="habitantes">Total Habitantes *</Label>
                    <Input type="number" id="habitantes" value={formData.cantidadHabitantes} onChange={(e) => setFormData({ ...formData, cantidadHabitantes: parseInt(e.target.value) || 0 })} required min={0} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="familias">Total Familias *</Label>
                    <Input type="number" id="familias" value={formData.cantidadFamilias} onChange={(e) => setFormData({ ...formData, cantidadFamilias: parseInt(e.target.value) || 0 })} required min={0} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ninos">Niños *</Label>
                    <Input type="number" id="ninos" value={formData.cantidadNinos} onChange={(e) => setFormData({ ...formData, cantidadNinos: parseInt(e.target.value) || 0 })} required min={0} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adolescentes">Adolescentes *</Label>
                    <Input type="number" id="adolescentes" value={formData.cantidadAdolescentes} onChange={(e) => setFormData({ ...formData, cantidadAdolescentes: parseInt(e.target.value) || 0 })} required min={0} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mayores">Adultos Mayores *</Label>
                    <Input type="number" id="mayores" value={formData.cantidadMayores} onChange={(e) => setFormData({ ...formData, cantidadMayores: parseInt(e.target.value) || 0 })} required min={0} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mayores60">Mayores de 60 *</Label>
                    <Input type="number" id="mayores60" value={formData.cantidadMayores60} onChange={(e) => setFormData({ ...formData, cantidadMayores60: parseInt(e.target.value) || 0 })} required min={0} />
                </div>

                {/* Logística */}
                <div className="col-span-full mt-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Logística y Recursos</h3>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="transporte" checked={formData.tieneTransporte} onCheckedChange={(checked) => setFormData({ ...formData, tieneTransporte: !!checked })} />
                    <Label htmlFor="transporte">Tiene Transporte</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="refrigerios" checked={formData.tieneRefrigerios} onCheckedChange={(checked) => setFormData({ ...formData, tieneRefrigerios: !!checked })} />
                    <Label htmlFor="refrigerios">Tiene Refrigerios</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="agua" checked={formData.tieneAgua} onCheckedChange={(checked) => setFormData({ ...formData, tieneAgua: !!checked })} />
                    <Label htmlFor="agua">Tiene Agua Potable</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="espacio" checked={formData.tieneEspacioCubierto} onCheckedChange={(checked) => setFormData({ ...formData, tieneEspacioCubierto: !!checked })} />
                    <Label htmlFor="espacio">Tiene Espacio Cubierto</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="material" checked={formData.tieneMaterialEducativo} onCheckedChange={(checked) => setFormData({ ...formData, tieneMaterialEducativo: !!checked })} />
                    <Label htmlFor="material">Tiene Material Educativo</Label>
                </div>

                <div className="col-span-full space-y-2">
                    <Label htmlFor="notas">Notas de Logística</Label>
                    <Textarea
                        id="notas"
                        value={formData.notasLogistica || ''}
                        onChange={(e) => setFormData({ ...formData, notasLogistica: e.target.value })}
                        className="min-h-[80px]"
                    />
                </div>

            </div>

            <div className="flex gap-2 justify-end pt-4 border-t mt-6">
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
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Actualizar Comunidad' : 'Guardar Comunidad'))}
                </Button>
            </div>
        </form>
    );
}
