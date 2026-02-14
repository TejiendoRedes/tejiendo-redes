'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Users, Phone, Info, UserCheck } from 'lucide-react';
import { Comunidad } from '@/db/schema/comunidades';
import { Responsable } from '@/db/schema/responsable';
import { createComunidad, deleteComunidad, updateComunidad } from '@/actions/comunidades-actions';
import { TIPO_COMUNIDAD_MAP } from '@/types/models';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getEstados, getMunicipiosByEstado, getParroquiasByMunicipio } from '@/data/venezuela-location';

interface ComunidadWithResponsable extends Comunidad {
    responsable: Responsable | null;
}

interface ComunidadesClientProps {
    initialData: ComunidadWithResponsable[];
    responsables: Responsable[];
}

export default function ComunidadesClient({ initialData, responsables }: ComunidadesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('basico');
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        codigoComunidad: '',
        nombreComunidad: '',
        tipoComunidad: '',
        estado: '',
        municipio: '',
        parroquia: '',
        direccion: '',
        ubicacionFisica: '',
        cedulaResponsable: '',
        cantidadHabitantes: 0,
        cantidadFamilias: 0,
        cantidadNinos: 0,
        cantidadAdolescentes: 0,
        cantidadMayores: 0,
        cantidadMayores60: 0,
        telefonoComunidad: '',
    });

    const [estados] = React.useState(getEstados());
    const [municipios, setMunicipios] = React.useState<any[]>([]);
    const [parroquias, setParroquias] = React.useState<any[]>([]);

    const generarCodigo = (prefix: string, length: number) => {
        return `${prefix}-${(length + 1).toString().padStart(3, '0')}`;
    };

    const handleAdd = () => {
        setFormData({
            codigoComunidad: '',
            nombreComunidad: '',
            tipoComunidad: '',
            estado: '',
            municipio: '',
            parroquia: '',
            direccion: '',
            ubicacionFisica: '',
            cedulaResponsable: '',
            cantidadHabitantes: 0,
            cantidadFamilias: 0,
            cantidadNinos: 0,
            cantidadAdolescentes: 0,
            cantidadMayores: 0,
            cantidadMayores60: 0,
            telefonoComunidad: '',
        });
        setMunicipios([]);
        setParroquias([]);
        setIsEditing(false);
        setActiveTab('basico');
        setIsModalOpen(true);
    };

    const handleEdit = (comunidad: ComunidadWithResponsable) => {
        setFormData({
            codigoComunidad: comunidad.codigoComunidad,
            nombreComunidad: comunidad.nombreComunidad,
            tipoComunidad: comunidad.tipoComunidad,
            estado: comunidad.estado || '',
            municipio: comunidad.municipio || '',
            parroquia: comunidad.parroquia || '',
            direccion: comunidad.direccion,
            ubicacionFisica: comunidad.ubicacionFisica,
            cedulaResponsable: comunidad.cedulaResponsable,
            cantidadHabitantes: comunidad.cantidadHabitantes,
            cantidadFamilias: comunidad.cantidadFamilias,
            cantidadNinos: comunidad.cantidadNinos || 0,
            cantidadAdolescentes: comunidad.cantidadAdolescentes || 0,
            cantidadMayores: comunidad.cantidadMayores || 0,
            cantidadMayores60: comunidad.cantidadMayores60 || 0,
            telefonoComunidad: comunidad.telefonoComunidad,
        });
        // Cargar municipios y parroquias para el estado y municipio seleccionados
        if (comunidad.estado) {
            setMunicipios(getMunicipiosByEstado(comunidad.estado));
            if (comunidad.municipio) {
                setParroquias(getParroquiasByMunicipio(comunidad.estado, comunidad.municipio));
            }
        }
        setIsEditing(true);
        setActiveTab('basico');
        setIsModalOpen(true);
    };

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

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta comunidad?')) {
            const res = await deleteComunidad(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombreComunidad || !formData.estado || !formData.municipio || !formData.cedulaResponsable) {
            toast.error('Por favor complete los campos obligatorios');
            return;
        }

        setIsLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await updateComunidad(formData.codigoComunidad, formData);
            } else {
                res = await createComunidad(formData);
            }

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<ComunidadWithResponsable>[] = [
        {
            key: 'codigoComunidad',
            label: 'Código',
            sortable: true
        },
        {
            key: 'nombreComunidad',
            label: 'Nombre',
            sortable: true,
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
        },
        {
            key: 'municipio',
            label: 'Municipio',
            sortable: true,
        },
        {
            key: 'parroquia',
            label: 'Parroquia',
            sortable: true,
        },
        {
            key: 'tipoComunidad',
            label: 'Tipo',
            render: (c) => TIPO_COMUNIDAD_MAP[c.tipoComunidad] || c.tipoComunidad
        },
        {
            key: 'cantidadHabitantes',
            label: 'Habitantes',
            render: (c) => c.cantidadHabitantes?.toLocaleString() || '0'
        },
        {
            key: 'demografia',
            label: 'Demografía',
            render: (c) => (
                <div className="text-sm space-y-1">
                    <div>Niños: {c.cantidadNinos?.toLocaleString() || '0'}</div>
                    <div>Adolescentes: {c.cantidadAdolescentes?.toLocaleString() || '0'}</div>
                    <div>Mayores 18+: {c.cantidadMayores?.toLocaleString() || '0'}</div>
                    <div>Mayores 60+: {c.cantidadMayores60?.toLocaleString() || '0'}</div>
                </div>
            ),
        },
        {
            key: 'responsable',
            label: 'Responsable',
            render: (c) => c.responsable ? `${c.responsable.nombreResponsable} ${c.responsable.apellidoResponsable}` : c.cedulaResponsable
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (c) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => handleEdit(c)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                        onClick={() => handleDelete(c.codigoComunidad)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Comunidades</h1>
                        <p className="text-gray-600">
                            Gestión de comunidades atendidas por la organización
                        </p>
                    </div>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar comunidad..."
                    onAdd={handleAdd}
                    addLabel="Agregar Comunidad"
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                {isEditing ? 'Editar Comunidad' : 'Registrar Nueva Comunidad'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los detalles geográficos y demográficos de la comunidad.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="basico" className="flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        Básico
                                    </TabsTrigger>
                                    <TabsTrigger value="ubicacion" className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Ubicación
                                    </TabsTrigger>
                                    <TabsTrigger value="social" className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Social
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="basico" className="space-y-4 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="codigo">Código de Comunidad</Label>
                                            <Input
                                                id="codigo"
                                                placeholder={isEditing ? "" : "Automático (COM-XXX)"}
                                                value={formData.codigoComunidad}
                                                disabled
                                                className="bg-gray-50 border-gray-200"
                                            />
                                            {!isEditing && (
                                                <p className="text-[10px] text-blue-600 font-medium font-sans">
                                                    El sistema asignará el código automáticamente al guardar.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre de la Comunidad *</Label>
                                            <Input
                                                id="nombre"
                                                placeholder="Ej. La Esperanza"
                                                value={formData.nombreComunidad}
                                                onChange={(e) => setFormData({ ...formData, nombreComunidad: e.target.value })}
                                                required
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tipo">Tipo de Comunidad</Label>
                                            <Select
                                                value={formData.tipoComunidad}
                                                onValueChange={(val) => setFormData({ ...formData, tipoComunidad: val })}
                                            >
                                                <SelectTrigger id="tipo">
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
                                            <Label htmlFor="telefono">Teléfono de Contacto</Label>
                                            <div className="flex gap-2">
                                                <Phone className="w-4 h-4 mt-3 text-gray-400" />
                                                <Input
                                                    id="telefono"
                                                    placeholder="0212-0000000"
                                                    value={formData.telefonoComunidad}
                                                    onChange={(e) => setFormData({ ...formData, telefonoComunidad: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <Button type="button" onClick={() => setActiveTab('ubicacion')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                            Siguiente: Ubicación
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="ubicacion" className="space-y-4 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="estado">Estado *</Label>
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
                                            <Label htmlFor="municipio">Municipio *</Label>
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
                                            <Label htmlFor="parroquia">Parroquia *</Label>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección Exacta</Label>
                                        <Input
                                            id="direccion"
                                            placeholder="Calle, Avenida, Número de casa..."
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="referencia">Ubicación Física (Punto de referencia)</Label>
                                        <Textarea
                                            id="referencia"
                                            placeholder="Ej. Detrás de la escuela, cerca del ambulatorio..."
                                            value={formData.ubicacionFisica}
                                            onChange={(e) => setFormData({ ...formData, ubicacionFisica: e.target.value })}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex justify-between pt-6">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab('basico')}>
                                            Atrás
                                        </Button>
                                        <Button type="button" onClick={() => setActiveTab('social')} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                                            Siguiente: Social
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-4 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="habitantes">Cantidad de Habitantes</Label>
                                            <Input
                                                id="habitantes"
                                                type="number"
                                                value={formData.cantidadHabitantes}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadHabitantes: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="familias">Cantidad de Familias</Label>
                                            <Input
                                                id="familias"
                                                type="number"
                                                value={formData.cantidadFamilias}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadFamilias: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="ninos">Niños/Niñas (0-12 años)</Label>
                                            <Input
                                                id="ninos"
                                                type="number"
                                                value={formData.cantidadNinos}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadNinos: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mayores">Mayores de Edad (18+ años)</Label>
                                            <Input
                                                id="mayores"
                                                type="number"
                                                value={formData.cantidadMayores}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadMayores: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adolescentes">Adolescentes (13-17 años)</Label>
                                            <Input
                                                id="adolescentes"
                                                type="number"
                                                value={formData.cantidadAdolescentes}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadAdolescentes: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mayores60">Adultos Mayores (60+ años)</Label>
                                            <Input
                                                id="mayores60"
                                                type="number"
                                                value={formData.cantidadMayores60}
                                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, cantidadMayores60: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="responsable" className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-blue-600" />
                                            Responsable de la Comunidad (Enlace Social) *
                                        </Label>
                                        <Select
                                            value={formData.cedulaResponsable}
                                            onValueChange={(val) => setFormData({ ...formData, cedulaResponsable: val })}
                                        >
                                            <SelectTrigger id="responsable">
                                                <SelectValue placeholder="Seleccione un responsable" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {responsables.map(r => (
                                                    <SelectItem key={r.cedulaResponsable} value={r.cedulaResponsable}>
                                                        {r.nombreResponsable} {r.apellidoResponsable} ({r.cedulaResponsable})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-between pt-6">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab('ubicacion')}>
                                            Atrás
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Comunidad')}
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
