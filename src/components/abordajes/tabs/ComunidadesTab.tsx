
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { AbordajeComunidadData } from '@/types/app-types';

interface ComunidadesTabProps {
    comunidades: AbordajeComunidadData[];
    onAdd: () => void;
}

export function ComunidadesTab({ comunidades, onAdd }: ComunidadesTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Button onClick={onAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Agregar Comunidad
                </Button>
            </div>
            {comunidades && comunidades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comunidades.map((comunidad) => (
                        <Card key={comunidad.codigoComunidad}>
                            <CardHeader>
                                <CardTitle className="text-lg">{comunidad.nombreComunidad}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <span>
                                        {comunidad.parroquia}, {comunidad.municipio}, {comunidad.estado}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <span>{comunidad.habitantes} habitantes</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="info"
                    title="Sin comunidades asignadas"
                    description="Este abordaje no tiene comunidades asignadas"
                />
            )}
        </div>
    );
}
