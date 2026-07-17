'use client';

import React, { useState, useEffect } from 'react';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BarChart, ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { getAbordajeById } from '@/queries/abordajes';
import { AbordajeWithRelations } from '@/types/app-types';
import { HistoryStation } from './HistoryStation';
import { StatisticsStation } from './StatisticsStation';

interface AbordajeHistorialEstadisticasProps {
    abordajes: any[];
}

export function AbordajeHistorialEstadisticas({ abordajes }: AbordajeHistorialEstadisticasProps) {
    const [selectedAbordajeId, setSelectedAbordajeId] = useState<string>('');
    const [abordaje, setAbordaje] = useState<AbordajeWithRelations | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!selectedAbordajeId) {
            setAbordaje(null);
            return;
        }

        const fetchAbordaje = async () => {
            setIsLoading(true);
            try {
                const res = await getAbordajeById(selectedAbordajeId);
                setAbordaje(res.success ? (res.data as AbordajeWithRelations) : null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAbordaje();
    }, [selectedAbordajeId]);

    const items = abordajes.map((ab: any) => {
        const abordajeData = ab.abordaje || ab;
        return {
            id: abordajeData.codigoAbordaje,
            label: `${abordajeData.codigoAbordaje} - ${new Date(abordajeData.fechaAbordaje || abordajeData.fecha).toLocaleDateString()}`,
            secondaryLabel: abordajeData.descripcion,
        };
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-4">
            <SearchableSelect
                label="Seleccione el Abordaje"
                items={items}
                value={selectedAbordajeId}
                onValueChange={setSelectedAbordajeId}
                placeholder="Busque y seleccione un abordaje para ver su historial y estadísticas"
                searchPlaceholder="Buscar por código..."
            />

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {!isLoading && !abordaje && (
                <EmptyState
                    icon="info"
                    title="Ningún abordaje seleccionado"
                    description="Seleccione un abordaje arriba para consultar su historial y estadísticas."
                />
            )}

            {!isLoading && abordaje && (
                <Tabs defaultValue="historial" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="historial">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Historial
                        </TabsTrigger>
                        <TabsTrigger value="estadisticas">
                            <BarChart className="w-4 h-4 mr-2" />
                            Estadísticas
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="historial" className="mt-0">
                        <HistoryStation abordaje={abordaje} />
                    </TabsContent>

                    <TabsContent value="estadisticas" className="mt-0">
                        <StatisticsStation abordaje={abordaje} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
