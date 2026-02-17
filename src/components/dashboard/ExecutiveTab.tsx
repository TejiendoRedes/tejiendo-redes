'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FileText, Pill } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface ExecutiveTabProps {
    data: {
        kpis: {
            totalPacientes: number;
            totalAbordajes: number;
            totalMedicamentos: number;
            avgAtenciones: number;
        };
        evolution: any[];
        geo: any[];
    };
}

export function ExecutiveTab({ data }: ExecutiveTabProps) {
    const { kpis, evolution = [], geo = [] } = data;

    const hasData = kpis.totalPacientes > 0 || kpis.totalAbordajes > 0;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Pacientes"
                    value={kpis.totalPacientes}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    description="Pacientes atendidos"
                />
                <KPICard
                    title="Abordajes Ejecutados"
                    value={kpis.totalAbordajes}
                    icon={<Activity className="w-6 h-6 text-green-600" />}
                    description="Jornadas realizadas"
                />
                <KPICard
                    title="Total Entregas Realizadas"
                    value={kpis.totalMedicamentos}
                    icon={<Pill className="w-6 h-6 text-purple-600" />}
                    description="Unidades entregadas"
                />
                <KPICard
                    title="Promedio Atenciones"
                    value={kpis.avgAtenciones}
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                    description="Por jornada"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Evolución de Atenciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {evolution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={evolution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="mes"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="cantidad"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            name="Consultas"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center space-y-2">
                                    <Activity className="w-12 h-12 text-gray-200 mx-auto" />
                                    <p className="text-sm text-gray-400">No hay datos de evolución para el periodo seleccionado</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Comunidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {geo.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={geo} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="comunidad"
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
                                        <Bar dataKey="pacientes" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Pacientes" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center space-y-2">
                                    <Users className="w-12 h-12 text-gray-200 mx-auto" />
                                    <p className="text-sm text-gray-400">Sin datos de distribución geográfica</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, description }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold">{value.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 mt-1">{description}</span>
                </div>
            </CardContent>
        </Card>
    );
}
