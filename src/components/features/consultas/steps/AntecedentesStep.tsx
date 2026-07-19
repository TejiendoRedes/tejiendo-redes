'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import type { WizardData } from '../ConsultaWizard';

interface StepProps {
    data: WizardData;
    updateData: (fields: Partial<WizardData>) => void;
}

export function AntecedentesStep({ data, updateData }: StepProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 fade-in">
            {/* Left Card */}
            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Antecedentes personales</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="enfermedadesPrevias" className="font-semibold text-gray-700">Antecedentes patológicos</Label>
                        <Textarea
                            id="enfermedadesPrevias"
                            placeholder="Diabetes, hipertensión, asma, etc..."
                            value={data.enfermedadesPrevias}
                            onChange={(e) => updateData({ enfermedadesPrevias: e.target.value })}
                            className="resize-none h-24 bg-gray-50 border-gray-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alergias" className="font-semibold text-gray-700">Alergias conocidas</Label>
                        <Textarea
                            id="alergias"
                            placeholder="Penicilina, AINEs, alimentos..."
                            value={data.alergias}
                            onChange={(e) => updateData({ alergias: e.target.value })}
                            className="resize-none h-20 bg-gray-50 border-gray-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cirugiasPrevias" className="font-semibold text-gray-700">Cirugías previas</Label>
                        <Textarea
                            id="cirugiasPrevias"
                            placeholder="Apendicectomía, etc..."
                            value={data.cirugiasPrevias}
                            onChange={(e) => updateData({ cirugiasPrevias: e.target.value })}
                            className="resize-none h-20 bg-gray-50 border-gray-200"
                        />
                    </div>
                </div>

            </Card>

            {/* Right Card */}
            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Antecedentes familiares y hábitos</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="enfermedadesFamilia" className="font-semibold text-gray-700">Antecedentes familiares</Label>
                        <Textarea
                            id="enfermedadesFamilia"
                            placeholder="Enfermedades hereditarias relevantes..."
                            value={data.enfermedadesFamilia}
                            onChange={(e) => updateData({ enfermedadesFamilia: e.target.value })}
                            className="resize-none h-24 bg-gray-50 border-gray-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medicamentosActuales" className="font-semibold text-gray-700">Medicamentos actuales</Label>
                        <Textarea
                            id="medicamentosActuales"
                            placeholder="Lista de medicamentos que toma actualmente..."
                            value={data.medicamentosActuales}
                            onChange={(e) => updateData({ medicamentosActuales: e.target.value })}
                            className="resize-none h-24 bg-gray-50 border-gray-200"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
