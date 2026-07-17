'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { addComunidadToAbordaje, removeComunidadFromAbordaje } from '@/actions/abordajes-actions';
import { getComunidades } from '@/queries/comunidades';;
import { AbordajeWithRelations } from '@/types/app-types';

interface CommunityStationProps {
    abordaje: any;
}

function getTipoComunidadLabel(tipoId?: string | null) {
    switch (tipoId) {
        case '1': return 'Urbana';
        case '2': return 'Rural';
        case '3': return 'Indígena';
        case '4': return 'Base de Misiones';
        default: return null;
    }
}

export function CommunityStation({ abordaje }: CommunityStationProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [allComunidades, setAllComunidades] = useState<any[]>([]);
    const [selectedComunidad, setSelectedComunidad] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all communities for the dropdown
    useEffect(() => {
        const fetchComunidades = async () => {
            const res = await getComunidades();
            if (res.success) {
                setAllComunidades(res.data || []);
            }
        };
        fetchComunidades();
    }, []);

    const comunidadesAsociadas = abordaje.comunidades || [];

    const handleAddComunidad = async () => {
        if (!selectedComunidad) {
            toast.error('Debes seleccionar una comunidad');
            return;
        }

        setIsLoading(true);
        try {
            const res = await addComunidadToAbordaje(abordaje.codigoAbordaje, selectedComunidad);
            if (res.success) {
                toast.success('Comunidad agregada exitosamente');
                setOpen(false);
                setSelectedComunidad('');
                router.refresh(); // Trigger data revalidation
            } else {
                toast.error(res.error || 'Error al agregar la comunidad');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveComunidad = async (codigoComunidad: string, nombreComunidad: string) => {
        if (!confirm(`¿Estás seguro de quitar "${nombreComunidad}" de este abordaje?`)) return;

        try {
            const res = await removeComunidadFromAbordaje(abordaje.codigoAbordaje, codigoComunidad);
            if (res.success) {
                toast.success('Comunidad removida exitosamente');
                router.refresh(); // Trigger data revalidation
            } else {
                toast.error(res.error || 'Error al remover la comunidad');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    // Filter out already associated communities
    const availableComunidades = allComunidades.filter(
        c => !comunidadesAsociadas.some((ac: any) => ac.codigoComunidad === c.codigoComunidad)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Comunidades</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona las comunidades visitadas en este abordaje
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Comunidad
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Comunidad al Abordaje</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Comunidad</label>
                                <SearchableSelect
                                    items={availableComunidades}
                                    value={selectedComunidad}
                                    onValueChange={setSelectedComunidad}
                                    placeholder="Seleccionar comunidad..."
                                    searchPlaceholder="Buscar comunidad..."
                                    idField="codigoComunidad"
                                    labelField="nombreComunidad"
                                    secondaryLabelField="municipio"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleAddComunidad} disabled={isLoading}>
                                    {isLoading ? 'Agregando...' : 'Agregar'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comunidadesAsociadas.length === 0 ? (
                    <Card className="col-span-full p-8 text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No hay comunidades asociadas a este abordaje</p>
                        <p className="text-sm mt-1">Haz clic en "Agregar Comunidad" para comenzar</p>
                    </Card>
                ) : (
                    comunidadesAsociadas.map((com: any) => (
                        <Card key={com.codigoComunidad} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">{com.nombreComunidad}</h3>
                                    </div>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        {getTipoComunidadLabel(com.tipoComunidad) && (
                                            <p><strong>Tipo:</strong> {getTipoComunidadLabel(com.tipoComunidad)}</p>
                                        )}
                                        <p><strong>Estado:</strong> {com.estado}</p>
                                        <p><strong>Municipio:</strong> {com.municipio}</p>
                                        {com.parroquia && <p><strong>Parroquia:</strong> {com.parroquia}</p>}
                                        {com.direccion && <p><strong>Dirección:</strong> {com.direccion}</p>}
                                        {com.telefonoComunidad && <p><strong>Teléfono:</strong> {com.telefonoComunidad}</p>}
                                        {com.habitantes && <p><strong>Habitantes:</strong> {com.habitantes}</p>}

                                        {(com.cantidadFamilias || com.cantidadNinos || com.cantidadAdolescentes || com.cantidadMayores || com.cantidadMayores60) && (
                                            <div className="grid grid-cols-2 gap-x-2 pt-2 border-t text-xs">
                                                {com.cantidadFamilias != null && <span><strong>Familias:</strong> {com.cantidadFamilias}</span>}
                                                {com.cantidadNinos != null && <span><strong>Niños:</strong> {com.cantidadNinos}</span>}
                                                {com.cantidadAdolescentes != null && <span><strong>Adolescentes:</strong> {com.cantidadAdolescentes}</span>}
                                                {com.cantidadMayores != null && <span><strong>Adultos:</strong> {com.cantidadMayores}</span>}
                                                {com.cantidadMayores60 != null && <span><strong>Mayores de 60:</strong> {com.cantidadMayores60}</span>}
                                            </div>
                                        )}

                                        {com.nombreResponsable && (
                                            <div className="pt-2 border-t">
                                                <p><strong>Responsable:</strong> {com.nombreResponsable} {com.apellidoResponsable}</p>
                                                {com.cargoResponsable && <p className="text-xs">{com.cargoResponsable}</p>}
                                                {com.telefonoResponsable && <p className="text-xs">Tel: {com.telefonoResponsable}</p>}
                                            </div>
                                        )}

                                        {com.observaciones && (
                                            <p className="text-xs italic mt-2 pt-2 border-t">
                                                <strong>Observaciones:</strong> {com.observaciones}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveComunidad(com.codigoComunidad, com.nombreComunidad)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
