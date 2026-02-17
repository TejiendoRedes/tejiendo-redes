
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { AbordajeMedicamentoData } from '@/types/app-types';

interface MedicamentosTabProps {
    medicamentos: AbordajeMedicamentoData[];
    onRegister: () => void;
}

export function MedicamentosTab({ medicamentos, onRegister }: MedicamentosTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Button onClick={onRegister} size="sm" className="gap-2">
                    <Pill className="w-4 h-4" /> Registrar Entrega
                </Button>
            </div>
            {medicamentos && medicamentos.length > 0 ? (
                <div className="space-y-4">
                    {medicamentos.map((entrega, index) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">{entrega.nombreMedicamento}</p>
                                            <p className="text-sm text-gray-500">{entrega.codigoMedicamento}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Paciente</p>
                                                <p className="text-sm font-medium">C.I. {entrega.cedulaPaciente}</p>
                                            </div>
                                            {entrega.cedulaTejedor && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Entregado por</p>
                                                    <p className="text-sm font-medium">C.I. {entrega.cedulaTejedor}</p>
                                                </div>
                                            )}
                                        </div>

                                        {entrega.indicaciones && (
                                            <div className="mt-2 bg-gray-50 p-2 rounded text-sm text-gray-700">
                                                <span className="font-semibold">Indicaciones:</span> {entrega.indicaciones}
                                            </div>
                                        )}
                                    </div>
                                    <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
                                        {entrega.cantidadEntregada} {entrega.cantidadEntregada === 1 ? 'unidad' : 'unidades'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="info"
                    title="Sin entregas de medicamentos"
                    description="No hay medicamentos entregados en este abordaje"
                />
            )}
        </div>
    );
}
