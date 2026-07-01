'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Stethoscope, AlertCircle, Activity } from 'lucide-react';
import type { WizardData } from '../ConsultaWizard';

interface StepProps {
    data: WizardData;
    updateData: (fields: Partial<WizardData>) => void;
    enfermedadesDisponibles: any[];
}

export function DiagnosticoStep({ data, updateData, enfermedadesDisponibles }: StepProps) {
    const toggleEnfermedad = (id: string, checked: boolean) => {
        if (checked) {
            updateData({ enfermedadesIds: [...data.enfermedadesIds, id] });
        } else {
            updateData({ enfermedadesIds: data.enfermedadesIds.filter(e => e !== id) });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 fade-in">
            {/* Left Column: Diagnóstico Narrativo */}
            <div className="space-y-6">
                <Card className="p-6 border-blue-100 shadow-sm rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">Motivo de consulta</h3>
                    </div>
                    <Textarea
                        placeholder="Describa el motivo principal por el que acude el paciente..."
                        value={data.motivoConsulta}
                        onChange={(e) => updateData({ motivoConsulta: e.target.value })}
                        className="resize-none h-28 bg-gray-50 border-gray-200"
                    />
                </Card>

                <Card className="p-6 border-blue-100 shadow-sm rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900">Impresión Diagnóstica</h3>
                    </div>
                    <Textarea
                        placeholder="Escriba el diagnóstico detallado..."
                        value={data.diagnosticoTexto}
                        onChange={(e) => updateData({ diagnosticoTexto: e.target.value })}
                        className="resize-none h-40 bg-gray-50 border-gray-200"
                    />
                </Card>
            </div>

            {/* Right Column: Selección de Enfermedades */}
            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl flex flex-col h-full max-h-[500px]">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Enfermedades Asociadas</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Seleccione las patologías diagnosticadas (para fines estadísticos y reporte):</p>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {enfermedadesDisponibles.map((enf, i) => (
                        <div key={`${enf.codigoEnfermedad}-${i}`} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                            <Checkbox
                                id={`enf-${enf.codigoEnfermedad}`}
                                checked={data.enfermedadesIds.includes(enf.codigoEnfermedad)}
                                onCheckedChange={(checked) => toggleEnfermedad(enf.codigoEnfermedad, checked as boolean)}
                                className="mt-0.5"
                            />
                            <div className="grid gap-1.5 leading-none cursor-pointer" onClick={() => toggleEnfermedad(enf.codigoEnfermedad, !data.enfermedadesIds.includes(enf.codigoEnfermedad))}>
                                <Label htmlFor={`enf-${enf.codigoEnfermedad}`} className="font-medium cursor-pointer">
                                    {enf.nombreEnfermedad}
                                </Label>
                            </div>
                        </div>
                    ))}
                    {enfermedadesDisponibles.length === 0 && (
                        <div className="text-center p-6 text-gray-500 text-sm border border-dashed rounded-xl">
                            No hay enfermedades registradas en el sistema.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
