'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import { Activity, PieChart as PieIcon, Layout, Stethoscope } from 'lucide-react';

interface OperationsTabProps {
    data: {
        efficiency: any[];
        types: any[];
        specialties: any[];
    };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];

export function OperationsTab({ data }: OperationsTabProps) {
    const { efficiency, types, specialties } = data;

    const typesData = types.map((t) => ({
        name: t.tipo || 'Sin Categoria',
        value: t.cantidad,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficiency: Estimados vs Reales */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Eficiencia de Convocatoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] flex items-center justify-center">
                        {efficiency.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={efficiency}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="Estimados" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="Reales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-2">
                                <Layout className="w-12 h-12 text-gray-200 mx-auto" />
                                <p className="text-sm text-gray-400">Sin datos de eficiencia registrados</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Approach Types */}
            <Card>
                <CardHeader>
                    <CardTitle>Tipos de Abordaje</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        {typesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typesData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {typesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-2">
                                <PieIcon className="w-12 h-12 text-gray-200 mx-auto" />
                                <p className="text-sm text-gray-400">Sin categorías de abordaje registradas</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Medical Specialties */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribución por Especialidad Médica</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        {specialties.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={specialties} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="subject"
                                        type="category"
                                        width={100}
                                        fontSize={12}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} name="Consultas" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center space-y-2">
                                <Stethoscope className="w-12 h-12 text-gray-200 mx-auto" />
                                <p className="text-sm text-gray-400">Sin datos de especialidades usados</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
