'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/shared/UIComponents';
import { Activity, Users, FileText, Pill, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
export default function DashboardPage() {
    const router = useRouter();

    // Calcular KPIs (Placeholders)
    const abordajesEsteMes = 0;
    const totalPacientes = 0;
    const consultasEsteMes = 0;
    const medicamentosEntregadosEsteMes = 0;

    // Medicamentos con stock bajo (Placeholder)
    const medicamentosStockBajo: any[] = [];

    // Datos para gráficas (Placeholders)
    const abordajesPorMes: any[] = [];
    const consultasPorTipo: any[] = [];


    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl text-gray-900">Dashboard</h1>
                    <Button onClick={() => router.push('/abordajes/nuevo')}>
                        Nuevo Abordaje
                    </Button>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        label="Abordajes este mes"
                        value={abordajesEsteMes}
                        icon={<Activity className="w-6 h-6" />}
                        change={{ value: 15, trend: 'up' }}
                    />
                    <StatsCard
                        label="Pacientes registrados"
                        value={totalPacientes}
                        icon={<Users className="w-6 h-6" />}
                    />
                    <StatsCard
                        label="Consultas este mes"
                        value={consultasEsteMes}
                        icon={<FileText className="w-6 h-6" />}
                        change={{ value: 8, trend: 'up' }}
                    />
                    <StatsCard
                        label="Entregas de medicamentos"
                        value={medicamentosEntregadosEsteMes}
                        icon={<Pill className="w-6 h-6" />}
                    />
                </div>

                {/* Alertas de stock */}
                {medicamentosStockBajo.length > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle className="w-5 h-5" />
                                Alertas de Stock Bajo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {medicamentosStockBajo.map(med => (
                                    <div
                                        key={med.codigoMedicamento}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                                    >
                                        <div>
                                            <p className="text-sm">{med.nombreMedicamento}</p>
                                            <p className="text-xs text-gray-600">
                                                Código: {med.codigoMedicamento}
                                            </p>
                                        </div>
                                        <Badge variant="destructive">
                                            {med.existencia}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => router.push('/farmacia/medicamentos')}
                            >
                                Gestionar Inventario
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Abordajes por mes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abordajes por Mes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={abordajesPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Consultas por tipo de morbilidad */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultas por Tipo de Morbilidad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={consultasPorTipo}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent = 0 }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {consultasPorTipo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Últimos abordajes (Placeholder) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Últimos Abordajes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6 text-gray-500">
                            No hay abordajes registrados recientemente.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

