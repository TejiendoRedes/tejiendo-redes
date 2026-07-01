'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Activity } from 'lucide-react';
import type { WizardData } from '../ConsultaWizard';

interface StepProps {
    data: WizardData;
    updateData: (fields: Partial<WizardData>) => void;
}

export function TriajeStep({ data, updateData }: StepProps) {
    return (
        <div className="mt-8 fade-in">
            <Card className="p-6 border-blue-100 shadow-sm rounded-2xl max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Signos vitales y medidas antropométricas</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="peso" className="font-semibold text-gray-700">Peso (kg)</Label>
                        <div className="relative">
                            <Input
                                id="peso"
                                type="number"
                                step="0.01"
                                placeholder="Ej: 70.5"
                                value={data.peso}
                                onChange={(e) => updateData({ peso: e.target.value })}
                                className="bg-gray-50 border-gray-200 pl-4 pr-10"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="talla" className="font-semibold text-gray-700">Talla (m)</Label>
                        <div className="relative">
                            <Input
                                id="talla"
                                type="number"
                                step="0.01"
                                placeholder="Ej: 1.75"
                                value={data.talla}
                                onChange={(e) => updateData({ talla: e.target.value })}
                                className="bg-gray-50 border-gray-200 pl-4 pr-10"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temperatura" className="font-semibold text-gray-700">Temperatura (°C)</Label>
                        <div className="relative">
                            <Input
                                id="temperatura"
                                type="number"
                                step="0.1"
                                placeholder="Ej: 36.5"
                                value={data.temperatura}
                                onChange={(e) => updateData({ temperatura: e.target.value })}
                                className="bg-gray-50 border-gray-200 pl-4 pr-10"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">°C</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="FC" className="font-semibold text-gray-700">Frecuencia Cardíaca</Label>
                        <div className="relative">
                            <Input
                                id="FC"
                                placeholder="Ej: 80 lpm"
                                value={data.FC}
                                onChange={(e) => updateData({ FC: e.target.value })}
                                className="bg-gray-50 border-gray-200 pl-4 pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">lpm</span>
                        </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="TA" className="font-semibold text-gray-700">Tensión Arterial</Label>
                        <div className="relative">
                            <Input
                                id="TA"
                                placeholder="Ej: 120/80 mmHg"
                                value={data.TA}
                                onChange={(e) => updateData({ TA: e.target.value })}
                                className="bg-gray-50 border-gray-200 pl-4 pr-14"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
