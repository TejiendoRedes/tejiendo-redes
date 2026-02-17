
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { AbordajeTejedorData } from '@/types/app-types';

interface TejedoresTabProps {
    tejedores: AbordajeTejedorData[];
    onAdd: () => void;
}

export function TejedoresTab({ tejedores, onAdd }: TejedoresTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Button onClick={onAdd} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Agregar Tejedor
                </Button>
            </div>
            {tejedores && tejedores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tejedores.map((tejedor) => (
                        <Card key={tejedor.cedulaTejedor}>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <p className="text-base font-medium">
                                        {tejedor.nombreTejedor} {tejedor.apellidoTejedor}
                                    </p>
                                    <Badge variant="secondary">{tejedor.rolAbordaje || 'Participante'}</Badge>
                                    <p className="text-sm text-gray-600">C.I. {tejedor.cedulaTejedor}</p>
                                    <p className="text-xs text-gray-500">{tejedor.profesionTejedor}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="info"
                    title="Sin tejedores asignados"
                    description="Este abordaje no tiene tejedores asignados"
                />
            )}
        </div>
    );
}
