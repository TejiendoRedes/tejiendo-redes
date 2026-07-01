'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pill, FileText } from 'lucide-react';
import type { WizardData } from '../ConsultaWizard';

interface StepProps {
    data: WizardData;
    updateData: (fields: Partial<WizardData>) => void;
}

export function TratamientoStep({ data, updateData }: StepProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 fade-in">
            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Plan de Tratamiento</h3>
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="tratamiento" className="sr-only">Tratamiento</Label>
                    <Textarea
                        id="tratamiento"
                        placeholder="Especifique medicamentos, dosis, frecuencia y duración..."
                        value={data.tratamiento}
                        onChange={(e) => updateData({ tratamiento: e.target.value })}
                        className="resize-none h-full min-h-[250px] bg-gray-50 border-gray-200"
                    />
                </div>
            </Card>

            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Recomendaciones adicionales</h3>
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="recomendaciones" className="sr-only">Recomendaciones</Label>
                    <Textarea
                        id="recomendaciones"
                        placeholder="Medidas generales, dieta, reposo, próximos controles..."
                        value={data.recomendaciones}
                        onChange={(e) => updateData({ recomendaciones: e.target.value })}
                        className="resize-none h-full min-h-[250px] bg-gray-50 border-gray-200"
                    />
                </div>
            </Card>
        </div>
    );
}
