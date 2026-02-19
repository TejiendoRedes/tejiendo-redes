import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Pill, HeartPulse, Stethoscope } from 'lucide-react';
import { AbordajeWithRelations } from '@/types/app-types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export function StatisticsStation({ abordaje }: { abordaje: AbordajeWithRelations }) {
    const totalConsultas = abordaje.total_consultas || abordaje.consultas?.length || 0;
    const pacientesUnicos = abordaje.pacientes_unicos ||
        new Set(abordaje.consultas?.map(c => c.cedulaPaciente)).size || 0;

    const totalMedicamentos = abordaje.medicamentos_entregados?.reduce((acc, curr) => acc + curr.cantidadEntregada, 0) || 0;
    const totalRecetas = abordaje.medicamentos_entregados?.length || 0;

    const totalTejedores = abordaje.tejedores?.length || 0;

    // Calcular medicamentos más entregados
    const medicamentosFreq = abordaje.medicamentos_entregados?.reduce((acc, curr) => {
        acc[curr.nombreMedicamento] = (acc[curr.nombreMedicamento] || 0) + curr.cantidadEntregada;
        return acc;
    }, {} as Record<string, number>) || {};

    const medicamentosData = Object.entries(medicamentosFreq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Calcular motivos de consulta
    const motivosFreq = abordaje.consultas?.reduce((acc, curr) => {
        const motivo = curr.motivoConsulta || 'No especificado';
        acc[motivo] = (acc[motivo] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const motivosData = Object.entries(motivosFreq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Diagnósticos frecuentes
    const diagnosticosFreq = abordaje.consultas?.reduce((acc, curr) => {
        const diag = curr.diagnosticoTexto?.trim();
        if (diag && diag.toLowerCase() !== 'ninguno' && diag !== 'No especificado') {
            acc[diag] = (acc[diag] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>) || {};

    const diagnosticosData = Object.entries(diagnosticosFreq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Atenciones por Médico
    const medicoFreq = abordaje.consultas?.reduce((acc, curr) => {
        if (curr.nombreMedico) {
            acc[curr.nombreMedico] = (acc[curr.nombreMedico] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>) || {};

    const medicosData = Object.entries(medicoFreq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Composición del Equipo (Profesiones)
    const profesionFreq = abordaje.tejedores?.reduce((acc, curr) => {
        const prof = curr.profesionTejedor || 'Otro';
        acc[prof] = (acc[prof] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const profesionesData = Object.entries(profesionFreq)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Custom Tooltips
    const CustomTooltipBar = ({ active, payload, label, unit = "uds" }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-md shadow-md p-3 text-sm">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="font-medium" style={{ color: payload[0].fill }}>
                        Cantidad: {payload[0].value} {unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltipPie = ({ active, payload, unit = "casos" }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-md shadow-md p-3 text-sm">
                    <p className="font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="font-medium" style={{ color: payload[0].payload.fill }}>
                        Total: {payload[0].value} {unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Abordaje</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Análisis detallado de las actividades, resultados y equipo del abordaje
                </p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consultas</CardTitle>
                        <Stethoscope className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConsultas}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pacientesUnicos}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Medicamentos Entregados</CardTitle>
                        <Pill className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMedicamentos}</div>
                        <p className="text-xs text-muted-foreground mt-1">En {totalRecetas} entregas</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipo Participante</CardTitle>
                        <HeartPulse className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTejedores}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tejedores voluntarios</p>
                    </CardContent>
                </Card>
            </div>

            {/* Fila 1: Motivos y Medicamentos */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Motivos de Consulta</CardTitle>
                        <CardDescription>Principales razones de atención médica (Top 5)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {motivosData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={motivosData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {motivosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipPie unit="casos" />} />
                                    <Legend verticalAlign="bottom" height={36} className="text-xs" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No hay datos de consultas registrados
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Medicamentos Más Entregados</CardTitle>
                        <CardDescription>Top 5 de insumos médicos distribuidos</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {medicamentosData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={medicamentosData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 12, fill: '#374151' }}
                                    />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltipBar unit="uds" />} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                        {medicamentosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No hay datos de medicamentos registrados
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Fila 2: Diagnósticos y Atenciones por médico */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Principales Diagnósticos</CardTitle>
                        <CardDescription>Condiciones encontradas más frecuentes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {diagnosticosData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={diagnosticosData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 12, fill: '#374151' }}
                                    />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltipBar unit="casos" />} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                        {diagnosticosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No hay diagnósticos registrados
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Consultas por Médico</CardTitle>
                        <CardDescription>Carga de atención médica por profesional</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {medicosData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={medicosData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {medicosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltipPie unit="consultas" />} />
                                    <Legend verticalAlign="bottom" height={36} className="text-xs" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No hay atenciones médicas registradas
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Fila 3: Composición del Equipo */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Composición del Equipo</CardTitle>
                        <CardDescription>Distribución de los voluntarios por profesión</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        {profesionesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={profesionesData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 12, fill: '#374151' }}
                                    />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltipBar unit="tejedores" />} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                        {profesionesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No hay tejedores registrados
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Posible 6to Gráfico si se necesita despues, por ahora dejamos este espacio vacio o que la card de arriba ocupe col-span-2. Pero para diseño lo dejamos en grid de 2, la de al lado queda vacia lo cual está OK */}
            </div>

        </div>
    );
}

