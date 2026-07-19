
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { AbordajeComunidadData } from '@/types/app-types';

interface ComunidadesTabProps {
    comunidad: AbordajeComunidadData | null;
}

export function ComunidadesTab({ comunidad }: ComunidadesTabProps) {
    return (
        <div className="space-y-4">
            {comunidad ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{comunidad.nombreComunidad}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                                <h4 className="font-semibold text-sm text-gray-500 uppercase">Ubicación</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <span>
                                        {comunidad.parroquia}, {comunidad.municipio}, {comunidad.estado}
                                    </span>
                                </div>
                                {comunidad.direccion && (
                                    <p className="text-sm text-gray-600 pl-6">{comunidad.direccion}</p>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                                <h4 className="font-semibold text-sm text-gray-500 uppercase">Datos Demográficos</h4>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <span>{comunidad.habitantes} habitantes estimados</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pl-6">
                                    <div>Familias: {comunidad.cantidadFamilias || 0}</div>
                                    <div>Niños: {comunidad.cantidadNinos || 0}</div>
                                    <div>Adolescentes: {comunidad.cantidadAdolescentes || 0}</div>
                                    <div>Mayores 60: {comunidad.cantidadMayores60 || 0}</div>
                                </div>
                            </div>
                        </div>

                        {comunidad.observaciones && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Observaciones de la Visita</h4>
                                <p className="text-sm text-gray-700">{comunidad.observaciones}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <EmptyState
                    icon="info"
                    title="Sin comunidad asignada"
                    description="Este abordaje no tiene una comunidad registrada."
                />
            )}
        </div>
    );
}
