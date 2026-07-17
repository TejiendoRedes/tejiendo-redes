'use client';

import React from 'react';
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Info, MapPin, Mail, Phone } from 'lucide-react';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Organismo } from '@/db/schema/organismos';
import { Tejedor } from '@/db/schema/tejedores';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';

export interface OrganismoFormProps {
    initialData?: Organismo;
    tejedores: Tejedor[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function OrganismoForm({
    initialData,
    tejedores,
    onSubmit,
    onCancel,
    isLoading = false,
}: OrganismoFormProps) {
    const isEditing = !!initialData;
    const [activeTab, setActiveTab] = React.useState('basico');

    const [formData, setFormData] = React.useState({
        codigoOrganismo: initialData?.codigoOrganismo || '',
        cedulaTejedor: initialData?.cedulaTejedor || '',
        nombreOrganismo: initialData?.nombreOrganismo || '',
        tipoInstitucion: initialData?.tipoInstitucion || '',
        paisOrganismo: initialData?.paisOrganismo || 'Venezuela',
        estadoOrganismo: initialData?.estadoOrganismo || '',
        municipioOrganismo: initialData?.municipioOrganismo || '',
        parroquiaOrganismo: (initialData as any)?.parroquiaOrganismo || '',
        direccionOrganismo: initialData?.direccionOrganismo || '',
        ubicacionFisica: initialData?.ubicacionFisica || '',
        correoOrganismo: initialData?.correoOrganismo || '',
        telefonoOrganismo: initialData?.telefonoOrganismo || '',
    });

    const [estados] = React.useState(getEstados());
    const [municipios, setMunicipios] = React.useState<any[]>(
        initialData?.estadoOrganismo ? getMunicipiosByEstado(initialData.estadoOrganismo) : []
    );
    const [parroquias, setParroquias] = React.useState<any[]>(
        initialData?.estadoOrganismo && initialData?.municipioOrganismo 
            ? getParroquiasByMunicipio(initialData.estadoOrganismo, initialData.municipioOrganismo) 
            : []
    );

    const handleEstadoChange = (estadoId: string) => {
        setFormData({ ...formData, estadoOrganismo: estadoId, municipioOrganismo: '', parroquiaOrganismo: '' });
        setMunicipios(getMunicipiosByEstado(estadoId));
        setParroquias([]);
    };

    const handleMunicipioChange = (municipioId: string) => {
        setFormData({ ...formData, municipioOrganismo: municipioId, parroquiaOrganismo: '' });
        setParroquias(getParroquiasByMunicipio(formData.estadoOrganismo, municipioId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const inputClass = "h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pt-4">
            {/* Sección Institucional */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                    <Info className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-lg font-semibold text-gray-800">Datos Institucionales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="codigo" className="text-gray-700">Código</Label>
                        <Input
                            id="codigo"
                            placeholder={isEditing ? "" : "Automático (ORG-XXX)"}
                            value={formData.codigoOrganismo}
                            disabled
                            className={`${inputClass} bg-gray-50 text-gray-500 font-mono`}
                        />
                        {!isEditing && (
                            <p className="text-[11px] text-blue-600 font-medium bg-blue-50 p-2 rounded-md">
                                El sistema generará el código automáticamente.
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-gray-700">Nombre de la Institución <span className="text-red-500 font-bold">*</span></Label>
                        <Input
                            id="nombre"
                            placeholder="Ej. Ministerio de Salud"
                            value={formData.nombreOrganismo}
                            onChange={(e) => setFormData({ ...formData, nombreOrganismo: e.target.value })}
                            required
                            maxLength={100}
                            className={`${inputClass} font-medium`}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-gray-700">Tipo de Institución <span className="text-red-500 font-bold">*</span></Label>
                    <Select
                        value={formData.tipoInstitucion}
                        onValueChange={(val) => setFormData({ ...formData, tipoInstitucion: val })}
                    >
                        <SelectTrigger id="tipo" className={inputClass}>
                            <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pública">Pública</SelectItem>
                            <SelectItem value="Gubernamental">Gubernamental</SelectItem>
                            <SelectItem value="Privada">Privada</SelectItem>
                            <SelectItem value="ONG">ONG</SelectItem>
                            <SelectItem value="Educacional">Educacional</SelectItem>
                            <SelectItem value="Salud">Salud</SelectItem>
                            <SelectItem value="Comunitaria">Comunitaria</SelectItem>
                            <SelectItem value="Religiosa">Religiosa</SelectItem>
                            <SelectItem value="Otra">Otra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-4">
                    <SearchableSelect
                        label="Tejedor de Enlace (Responsable Interno) *"
                        items={tejedores}
                        value={formData.cedulaTejedor}
                        onValueChange={(val) => setFormData({ ...formData, cedulaTejedor: val })}
                        placeholder="Seleccione un tejedor"
                        searchPlaceholder="Buscar por nombre o cédula..."
                        idField="cedulaTejedor"
                        labelField="nombreTejedor"
                        secondaryLabelField="apellidoTejedor"
                    />
                </div>
            </div>

            {/* Sección Ubicación */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-lg font-semibold text-gray-800">Ubicación Geográfica</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pais" className="text-gray-700">País</Label>
                        <Input
                            id="pais"
                            value={formData.paisOrganismo}
                            onChange={(e) => setFormData({ ...formData, paisOrganismo: e.target.value })}
                            maxLength={50}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado" className="text-gray-700">Estado <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.estadoOrganismo}
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger id="estado" className={inputClass}>
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
                        <Label htmlFor="municipio" className="text-gray-700">Municipio <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.municipioOrganismo}
                            onValueChange={handleMunicipioChange}
                            disabled={!formData.estadoOrganismo}
                        >
                            <SelectTrigger id="municipio" className={inputClass}>
                                <SelectValue placeholder={formData.estadoOrganismo ? "Seleccione un municipio" : "Seleccione primero el estado"} />
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
                        <Label htmlFor="parroquia" className="text-gray-700">Parroquia <span className="text-red-500 font-bold">*</span></Label>
                        <Select
                            value={formData.parroquiaOrganismo}
                            onValueChange={(val) => setFormData({ ...formData, parroquiaOrganismo: val })}
                            disabled={!formData.municipioOrganismo}
                        >
                            <SelectTrigger id="parroquia" className={inputClass}>
                                <SelectValue placeholder={formData.municipioOrganismo ? "Seleccione una parroquia" : "Seleccione primero el municipio"} />
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
                <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-gray-700">Dirección Fiscal / Sede</Label>
                    <Input
                        id="direccion"
                        placeholder="Av. Principal, Edificio..."
                        value={formData.direccionOrganismo}
                        onChange={(e) => setFormData({ ...formData, direccionOrganismo: e.target.value })}
                        maxLength={150}
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fisica" className="text-gray-700">Ubicación Física (Piso/Oficina)</Label>
                    <Textarea
                        id="fisica"
                        placeholder="Ej. Piso 5, Oficina 502..."
                        value={formData.ubicacionFisica || ''}
                        onChange={(e) => setFormData({ ...formData, ubicacionFisica: e.target.value })}
                        className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all py-3"
                    />
                </div>
            </div>

            {/* Sección Contacto */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                    <Mail className="w-5 h-5 text-[#1e3a8a]" />
                    <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="correo" className="text-gray-700">Correo Electrónico <span className="text-red-500 font-bold">*</span></Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="correo"
                                type="email"
                                placeholder="contacto@organismo.gob.ve"
                                value={formData.correoOrganismo}
                                onChange={(e) => setFormData({ ...formData, correoOrganismo: e.target.value })}
                                required
                                maxLength={100}
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-gray-700">Teléfono</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="telefono"
                                placeholder="0212-0000000"
                                value={formData.telefonoOrganismo || ''}
                                onChange={(e) => setFormData({ ...formData, telefonoOrganismo: e.target.value })}
                                maxLength={15}
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start mt-6">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800/90 leading-relaxed">
                        Asegúrese de que el <span className="font-semibold text-blue-900">tejedor de enlace</span> seleccionado tenga sus datos de contacto actualizados, ya que será el punto de conexión principal con esta institución.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-8 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} className="px-6 border-gray-200 hover:bg-gray-50 text-gray-600" disabled={isLoading}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="px-8 bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Institución')}
                </Button>
            </div>
        </form>
    );
}
