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
} from 'recharts';

interface EpidemiologyTabProps {
    data: {
        pathologies: any[];
        imc: { bajo: number; normal: number; sobrepeso: number; obesidad: number };
        pyramid: any[];
        hypertension: { hipertensos: number; sanos: number; total: number };
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const HYPERTENSION_COLORS = ['#ef4444', '#10b981']; // Red for Hyper, Green for Healthy

export function EpidemiologyTab({ data }: EpidemiologyTabProps) {
    const { pathologies, imc, pyramid, hypertension } = data;

    const imcData = [
        { name: 'Bajo Peso', value: imc.bajo },
        { name: 'Normal', value: imc.normal },
        { name: 'Sobrepeso', value: imc.sobrepeso },
        { name: 'Obesidad', value: imc.obesidad },
    ].filter(d => d.value > 0);

    const hypertensionData = [
        { name: 'Hipertensos', value: hypertension.hipertensos },
        { name: 'Sanos', value: hypertension.sanos },
    ].filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pathologies */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Top 10 Patologías</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pathologies} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="enfermedad" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#8884d8" radius={[0, 4, 4, 0]} name="Casos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* IMC Donut */}
            <Card>
                <CardHeader>
                    <CardTitle>Estado Nutricional (IMC)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={imcData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {imcData.map((entry, index) => ( // eslint-disable-line
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Hypertension */}
            <Card>
                <CardHeader>
                    <CardTitle>Prevalencia Hipertensión</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={hypertensionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {hypertensionData.map((entry, index) => ( // eslint-disable-line
                                        <Cell key={`cell-${index}`} fill={HYPERTENSION_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Population Pyramid */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Pirámide Poblacional</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={pyramid}
                                layout="vertical"
                                stackOffset="sign"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="label" type="category" width={80} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="M" fill="#3b82f6" name="Hombres" stackId="stack" />
                                <Bar dataKey="F" fill="#ec4899" name="Mujeres" stackId="stack" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
