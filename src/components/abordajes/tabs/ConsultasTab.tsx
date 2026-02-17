
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { AbordajeConsultaData } from '@/types/app-types';

interface ConsultasTabProps {
    consultas: AbordajeConsultaData[];
    codigoAbordaje: string;
}

export function ConsultasTab({ consultas, codigoAbordaje }: ConsultasTabProps) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Button onClick={() => router.push(`/abordajes/${codigoAbordaje}/nueva-consulta`)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Nueva Consulta
                </Button>
            </div>
            {consultas && consultas.length > 0 ? (
                <div className="space-y-4">
                    {consultas.map((consulta) => (
                        <Card key={consulta.codigoConsulta}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{consulta.codigoConsulta}</CardTitle>
                                    <Badge variant="outline">{new Date(consulta.fechaConsulta).toLocaleDateString()}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Paciente</p>
                                    <p className="text-base">C.I. {consulta.cedulaPaciente}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Motivo</p>
                                    <p className="text-base">{consulta.motivoConsulta}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Diagnóstico</p>
                                    <p className="text-base">{consulta.diagnosticoTexto}</p>
                                </div>
                                {consulta.tensionArterial && (
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Tensión Arterial</p>
                                        <Badge variant="secondary" className="text-sm font-mono mt-1">
                                            {consulta.tensionArterial}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="info"
                    title="Sin consultas registradas"
                    description="Este abordaje no tiene consultas médicas registradas"
                />
            )}
        </div>
    );
}
