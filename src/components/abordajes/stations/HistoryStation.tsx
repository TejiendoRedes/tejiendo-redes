'use client';

import { Users, FileText, Pill, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface HistoryStationProps {
    abordaje: any;
}

export function HistoryStation({ abordaje }: HistoryStationProps) {
    const totalComunidades = abordaje.comunidades?.length || 0;
    const totalTejedores = abordaje.tejedores?.length || 0;
    const totalConsultas = abordaje.consultas?.length || 0;
    const totalEntregas = abordaje.medicamentos_entregados?.length || 0;
    const pacientesUnicos = abordaje.pacientes_unicos || new Set((abordaje.consultas || []).map((c: any) => c.cedulaPaciente)).size;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Historial y Resumen</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Vista consolidada de todo lo ocurrido en este abordaje
                </p>
            </div>

            {/* ESTADÍSTICAS GENERALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <MapPin className="w-8 h-8 text-blue-600" />
                        <span className="text-3xl font-bold text-blue-600">{totalComunidades}</span>
                    </div>
                    <p className="text-sm text-gray-600">Comunidades Visitadas</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-8 h-8 text-green-600" />
                        <span className="text-3xl font-bold text-green-600">{totalTejedores}</span>
                    </div>
                    <p className="text-sm text-gray-600">Tejedores Participantes</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <span className="text-3xl font-bold text-purple-600">{totalConsultas}</span>
                    </div>
                    <p className="text-sm text-gray-600">Consultas Realizadas</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                        <Pill className="w-8 h-8 text-orange-600" />
                        <span className="text-3xl font-bold text-orange-600">{totalEntregas}</span>
                    </div>
                    <p className="text-sm text-gray-600">Medicamentos Entregados</p>
                </Card>
            </div>

            {/* DETALLES ADICIONALES */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detalles del Abordaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600 mb-1">Participantes Estimados:</p>
                        <p className="font-semibold">{abordaje.participantesEstimados || 'No especificado'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 mb-1">Tipo de Abordaje:</p>
                        <p className="font-semibold">{abordaje.tipoAbordaje || 'No especificado'}</p>
                    </div>
                    {abordaje.recursosAdicionales && (
                        <div className="col-span-full border-t pt-4">
                            <p className="text-gray-600 mb-1 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Recursos Adicionales:
                            </p>
                            <p className="font-medium bg-gray-50 p-3 rounded-md text-gray-800">
                                {abordaje.recursosAdicionales}
                            </p>
                        </div>
                    )}
                    {abordaje.notas && (
                        <div className="col-span-full border-t pt-4">
                            <p className="text-gray-600 mb-1">Observaciones Generales:</p>
                            <p className="font-medium bg-gray-50 p-3 rounded-md text-gray-800">
                                {abordaje.notas}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
