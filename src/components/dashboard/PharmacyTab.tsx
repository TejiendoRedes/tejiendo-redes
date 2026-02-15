'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

interface PharmacyTabProps {
    data: {
        topMeds: any[];
        lowStock: any[];
        consumptionByAge: any[];
    };
}

export function PharmacyTab({ data }: PharmacyTabProps) {
    const { topMeds, lowStock, consumptionByAge } = data;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Rotated Meds */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Medicamentos Más Rotados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMeds}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" fontSize={12} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#8884d8" name="Entregados" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Consumption by Age */}
            <Card>
                <CardHeader>
                    <CardTitle>Consumo por Grupo Etario</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={consumptionByAge}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" name="Unidades" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Critical Stock Alert */}
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        Stock Crítico ({lowStock.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                        {lowStock.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay alertas de stock bajo.</p>
                        ) : (
                            lowStock.map((med) => (
                                <div
                                    key={med.codigoMedicamento}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{med.nombreMedicamento}</p>
                                        <p className="text-xs text-gray-500">{med.presentacion}</p>
                                    </div>
                                    <Badge variant="destructive">
                                        {med.existencia}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
