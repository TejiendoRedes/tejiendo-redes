
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { AbordajeWithRelations } from '@/types/app-types';

interface DetallesTabProps {
    abordajeData: AbordajeWithRelations;
}

export function DetallesTab({ abordajeData }: DetallesTabProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Información y Observaciones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tipo de Abordaje</p>
                            <p className="text-base font-medium">{abordajeData.tipoAbordaje || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Participantes Estimados</p>
                            <p className="text-base font-medium">{abordajeData.participantesEstimados || 'No especificado'}</p>
                        </div>
                    </div>

                    {abordajeData.recursosAdicionales && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-1">Recursos Adicionales</p>
                            <p className="text-sm bg-gray-50 p-4 rounded-lg">{abordajeData.recursosAdicionales}</p>
                        </div>
                    )}
                    {abordajeData.notas && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-1">Observaciones Generales</p>
                            <p className="text-sm bg-gray-50 p-4 rounded-lg">{abordajeData.notas}</p>
                        </div>
                    )}
                    {abordajeData.codigoSolicitud && (
                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-400">Originado de la solicitud: {abordajeData.codigoSolicitud}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
