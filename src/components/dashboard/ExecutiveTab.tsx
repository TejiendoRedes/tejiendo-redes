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
    const { kpis, evolution, geo } = data;

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
                    title="Medicamentos"
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
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="cantidad"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        name="Consultas"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Comunidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={geo} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="comunidad" type="category" width={100} fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="pacientes" fill="#059669" radius={[0, 4, 4, 0]} name="Pacientes" />
                                </BarChart>
                            </ResponsiveContainer>
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
