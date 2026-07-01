'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Filter, Loader2, BarChart as BarChartIcon, PieChart as PieChartIcon, Table as TableIcon } from 'lucide-react';
import { DataTable } from '@/components/ui-kit/DataTable';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF, ExportColumn } from '@/lib/export-utils';
import { getEstadoNombre, getMunicipioNombre, VENEZUELA_DATA, Estado, Municipio, Parroquia } from '@/data/venezuela-location';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { ReporteAbordajeItem, ReporteComunidadItem, ReportePacienteItem, ReporteMorbilidadItem, ReporteMedicamentoItem } from '@/types/app-types';

interface ReportesClientProps {
    comunidades: Array<{ codigo_comunidad: string; nombre_comunidad: string }>;
    reporteAbordajes: ReporteAbordajeItem[];
    reporteComunidades: ReporteComunidadItem[];
    reportePacientes: ReportePacienteItem[];
    dataMorbilidad: ReporteMorbilidadItem[];
    reporteMedicamentos: ReporteMedicamentoItem[];
}

export default function ReportesClient({
    comunidades,
    reporteAbordajes,
    reporteComunidades,
    reportePacientes,
    dataMorbilidad,
    reporteMedicamentos
}: ReportesClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [fechaInicio, setFechaInicio] = useState(searchParams.get('fechaInicio') || '');
    const [fechaFin, setFechaFin] = useState(searchParams.get('fechaFin') || '');
    const [comunidadFiltro, setComunidadFiltro] = useState(searchParams.get('codigoComunidad') || 'todas');
    const [estadoFiltro, setEstadoFiltro] = useState(searchParams.get('estado') || 'todos');
    const [municipioFiltro, setMunicipioFiltro] = useState(searchParams.get('municipio') || 'todos');
    const [parroquiaFiltro, setParroquiaFiltro] = useState(searchParams.get('parroquia') || 'todas');
    const [tipoComunidadFiltro, setTipoComunidadFiltro] = useState(searchParams.get('tipoComunidad') || 'todos');

    const [chartViews, setChartViews] = useState<Record<string, 'table' | 'bar' | 'pie'>>({
        abordajes: 'table',
        comunidades: 'table',
        pacientes: 'bar', // Changed default for patients to show the new charts
        morbilidad: 'table',
        medicamentos: 'table'
    });

    // Lógica de Grupos Etarios
    const ageGroups = React.useMemo(() => {
        const groups = {
            'Niñez (0-12)': 0,
            'Adolescencia (13-17)': 0,
            'Adultez (18-59)': 0,
            'Adulto Mayor (60+)': 0,
            'No especificado': 0
        };

        const calculateAge = (birthday: Date | string | null) => {
            if (!birthday) return -1;
            const birthDate = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        reportePacientes.forEach(p => {
            const age = calculateAge(p.fecha_nacimiento);
            if (age === -1) groups['No especificado']++;
            else if (age <= 12) groups['Niñez (0-12)']++;
            else if (age <= 17) groups['Adolescencia (13-17)']++;
            else if (age <= 59) groups['Adultez (18-59)']++;
            else groups['Adulto Mayor (60+)']++;
        });

        return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }, [reportePacientes]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    const availableEstados = VENEZUELA_DATA;
    const availableMunicipios = estadoFiltro !== 'todos' ? VENEZUELA_DATA.find(e => e.id === estadoFiltro)?.municipios || [] : [];
    const availableParroquias = (estadoFiltro !== 'todos' && municipioFiltro !== 'todos') ? availableMunicipios.find(m => m.id === municipioFiltro)?.parroquias || [] : [];

    const updateFilters = () => {
        const params = new URLSearchParams();

        if (fechaInicio) params.set('fechaInicio', fechaInicio);
        if (fechaFin) params.set('fechaFin', fechaFin);
        if (comunidadFiltro && comunidadFiltro !== 'todas') params.set('codigoComunidad', comunidadFiltro);
        if (estadoFiltro && estadoFiltro !== 'todos') params.set('estado', estadoFiltro);
        if (municipioFiltro && municipioFiltro !== 'todos') params.set('municipio', municipioFiltro);
        if (parroquiaFiltro && parroquiaFiltro !== 'todas') params.set('parroquia', parroquiaFiltro);
        if (tipoComunidadFiltro && tipoComunidadFiltro !== 'todos') params.set('tipoComunidad', tipoComunidadFiltro);

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const renderChartControls = (tab: string) => (
        <div className="flex bg-gray-50/80 rounded-xl p-1 items-center mr-2 border border-gray-100 backdrop-blur-sm shadow-inner">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'table' }))}
                title="Ver Tabla"
                className={`rounded-lg transition-all ${chartViews[tab] === 'table' ? 'bg-white shadow-sm text-[#1e3a8a] hover:text-blue-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'}`}
            >
                <TableIcon className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'bar' }))}
                title="Gráfico de Barras"
                className={`rounded-lg transition-all ${chartViews[tab] === 'bar' ? 'bg-white shadow-sm text-[#1e3a8a] hover:text-blue-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'}`}
            >
                <BarChartIcon className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'pie' }))}
                title="Gráfico Circular"
                className={`rounded-lg transition-all ${chartViews[tab] === 'pie' ? 'bg-white shadow-sm text-[#1e3a8a] hover:text-blue-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100/50'}`}
            >
                <PieChartIcon className="w-4 h-4" />
            </Button>
        </div>
    );

    const handleExport = (format: 'csv' | 'pdf', tabName: string, data: any[], columns: any[]) => {
        try {
            const exportColumns: ExportColumn<any>[] = columns.map(col => ({
                header: col.label,
                key: col.key,
                render: col.render
            }));

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `reporte-${tabName}-${timestamp}`;
            const title = `Reporte de ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;

            if (format === 'csv') {
                exportToCSV(data, exportColumns, filename);
                toast.success('Reporte CSV exportado exitosamente');
            } else {
                exportToPDF(data, exportColumns, filename, title);
                toast.success('Reporte PDF exportado exitosamente');
            }
        } catch (error) {
            console.error('Error exportando:', error);
            toast.error('Error al exportar el reporte');
        }
    };

    return (
        <div className="space-y-6">
            {/* Filtros Globales */}
            <Card className="rounded-2xl shadow-sm border-gray-100 overflow-visible bg-white/70 backdrop-blur-md">
                <CardHeader className="bg-transparent border-b border-gray-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                        <Filter className="w-5 h-5 text-[#1e3a8a]" />
                        Filtros de Reporte
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full">
                            <div className="space-y-2">
                                <Label htmlFor="fechaInicio" className="text-xs">Fecha Inicio</Label>
                                <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fechaFin" className="text-xs">Fecha Fin</Label>
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tipoComunidad" className="text-xs">Tipo Comunidad</Label>
                                <Select value={tipoComunidadFiltro} onValueChange={setTipoComunidadFiltro}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="1">Urbana</SelectItem>
                                        <SelectItem value="2">Rural</SelectItem>
                                        <SelectItem value="3">Indígena</SelectItem>
                                        <SelectItem value="4">Base de Misiones</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="comunidad" className="text-xs">Comunidad (Busq. Exacta)</Label>
                                <Select value={comunidadFiltro} onValueChange={setComunidadFiltro}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione comunidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todas">Todas las comunidades</SelectItem>
                                        {comunidades.map((c) => (
                                            <SelectItem key={c.codigo_comunidad} value={c.codigo_comunidad}>
                                                {c.nombre_comunidad}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2 flex items-end">
                                <Button onClick={updateFilters} disabled={isPending} className="w-full rounded-xl bg-[#1e3a8a] hover:bg-blue-900 shadow-sm text-white">
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Aplicar Filtros
                                </Button>
                            </div>

                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="estado" className="text-xs">Estado</Label>
                                <Select value={estadoFiltro} onValueChange={(val) => { setEstadoFiltro(val); setMunicipioFiltro('todos'); setParroquiaFiltro('todas'); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los estados</SelectItem>
                                        {availableEstados.map((e) => (
                                            <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="municipio" className="text-xs">Municipio</Label>
                                <Select value={municipioFiltro} onValueChange={(val) => { setMunicipioFiltro(val); setParroquiaFiltro('todas'); }} disabled={estadoFiltro === 'todos'}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los municipios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los municipios</SelectItem>
                                        {availableMunicipios.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="parroquia" className="text-xs">Parroquia</Label>
                                <Select value={parroquiaFiltro} onValueChange={setParroquiaFiltro} disabled={municipioFiltro === 'todos'}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las parroquias" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todas">Todas las parroquias</SelectItem>
                                        {availableParroquias.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs de Reportes */}
            <Tabs defaultValue="abordajes" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 h-auto">
                    <TabsTrigger value="abordajes" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all cursor-pointer">Abordajes</TabsTrigger>
                    <TabsTrigger value="comunidades" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all cursor-pointer">Comunidades</TabsTrigger>
                    <TabsTrigger value="pacientes" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all cursor-pointer">Pacientes</TabsTrigger>
                    <TabsTrigger value="morbilidad" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all cursor-pointer">Morbilidad</TabsTrigger>
                    <TabsTrigger value="medicamentos" className="rounded-lg py-2.5 font-medium data-[state=active]:bg-[#1e3a8a]/10 data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all cursor-pointer">Medicamentos</TabsTrigger>
                </TabsList>

                {/* Reporte Abordajes */}
                <TabsContent value="abordajes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-b border-gray-50/80 pb-4">
                            <CardTitle className="text-xl text-gray-800">Reporte de Abordajes</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('abordajes')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => handleExport('csv', 'Abordajes', reporteAbordajes, [
                                        { key: 'codigo_abordaje', label: 'Código' },
                                        { key: 'fecha_abordaje', label: 'Fecha', render: (item: ReporteAbordajeItem) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE', { timeZone: 'UTC' }) },
                                        { key: 'descripcion', label: 'Descripción' },
                                        { key: 'comunidades', label: 'Comunidades' },
                                        { key: 'pacientes_atendidos', label: 'Pacientes' }
                                    ])}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf', 'Abordajes', reporteAbordajes, [
                                        { key: 'codigo_abordaje', label: 'Código' },
                                        { key: 'fecha_abordaje', label: 'Fecha', render: (item: ReporteAbordajeItem) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE', { timeZone: 'UTC' }) },
                                        { key: 'descripcion', label: 'Descripción' },
                                        { key: 'comunidades', label: 'Comunidades' },
                                        { key: 'pacientes_atendidos', label: 'Pacientes' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartViews.abordajes === 'table' && (
                                <DataTable
                                    data={reporteAbordajes}
                                    columns={[
                                        { key: 'codigo_abordaje', header: 'Código', sortable: true },
                                        {
                                            key: 'fecha_abordaje',
                                            header: 'Fecha',
                                            sortable: true,
                                            render: (item: ReporteAbordajeItem) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                        },
                                        { key: 'descripcion', header: 'Descripción' },
                                        { key: 'comunidades', header: 'Comunidades', sortable: true },
                                        { key: 'pacientes_atendidos', header: 'Pacientes Atendidos', sortable: true },
                                        { key: 'hora_inicio', header: 'Hora Inicio', sortable: true },
                                        { key: 'hora_fin', header: 'Hora Fin', sortable: true },
                                    ]}
                                    searchPlaceholder="Buscar abordaje..."
                                />
                            )}
                            {chartViews.abordajes === 'bar' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reporteAbordajes} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="codigo_abordaje" angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="pacientes_atendidos" name="Pacientes Atendidos" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.abordajes === 'pie' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={reporteAbordajes}
                                                dataKey="pacientes_atendidos"
                                                nameKey="codigo_abordaje"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label
                                            >
                                                {reporteAbordajes.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Comunidades */}
                <TabsContent value="comunidades" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-b border-gray-50/80 pb-4">
                            <CardTitle className="text-xl text-gray-800">Reporte de Comunidades</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('comunidades')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Comunidades', reporteComunidades, [
                                        { key: 'codigo_comunidad', label: 'Código' },
                                        { key: 'nombre_comunidad', label: 'Nombre' },
                                        { key: 'estado', label: 'Estado', render: (item: ReporteComunidadItem) => getEstadoNombre(item.estado) },
                                        { key: 'municipio', label: 'Municipio', render: (item: ReporteComunidadItem) => getMunicipioNombre(item.estado, item.municipio) },
                                        { key: 'parroquia', label: 'Parroquia' },
                                        { key: 'cantidad_habitantes', label: 'Habitantes' },
                                        { key: 'cantidad_familias', label: 'Familias' },
                                        { key: 'pacientes_tratados', label: 'Pacientes' },
                                        { key: 'total_consultas', label: 'Consultas' },
                                    ])}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf', 'Comunidades', reporteComunidades, [
                                        { key: 'codigo_comunidad', label: 'Código' },
                                        { key: 'nombre_comunidad', label: 'Nombre' },
                                        { key: 'estado', label: 'Estado', render: (item: ReporteComunidadItem) => getEstadoNombre(item.estado) },
                                        { key: 'municipio', label: 'Municipio', render: (item: ReporteComunidadItem) => getMunicipioNombre(item.estado, item.municipio) },
                                        { key: 'cantidad_habitantes', label: 'Hab.' },
                                        { key: 'pacientes_tratados', label: 'Pac.' },
                                        { key: 'total_consultas', label: 'Cons.' },
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartViews.comunidades === 'table' && (
                                <DataTable
                                    data={reporteComunidades}
                                    columns={[
                                        { key: 'codigo_comunidad', header: 'Código', sortable: true },
                                        { key: 'nombre_comunidad', header: 'Nombre Comunidad', sortable: true },
                                        {
                                            key: 'estado',
                                            header: 'Estado',
                                            sortable: true,
                                            render: (item: ReporteComunidadItem) => getEstadoNombre(item.estado)
                                        },
                                        {
                                            key: 'municipio',
                                            header: 'Municipio',
                                            sortable: true,
                                            render: (item: ReporteComunidadItem) => getMunicipioNombre(item.estado, item.municipio)
                                        },
                                        { key: 'parroquia', header: 'Parroquia', sortable: true },
                                        { key: 'cantidad_habitantes', header: 'Habitantes', sortable: true },
                                        { key: 'cantidad_familias', header: 'Familias', sortable: true },
                                        {
                                            key: 'pacientes_tratados',
                                            header: 'Pacientes Tratados',
                                            sortable: true,
                                        },
                                        {
                                            key: 'abordajes_realizados',
                                            header: 'Abordajes Realizados',
                                            sortable: true,
                                        },
                                        { key: 'total_consultas', header: 'Consultas Realizadas', sortable: true },
                                    ]}
                                    searchPlaceholder="Buscar comunidad..."
                                />
                            )}
                            {chartViews.comunidades === 'bar' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reporteComunidades} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="nombre_comunidad" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend verticalAlign="top" />
                                            <Bar dataKey="pacientes_tratados" name="Pacientes Tratados" fill="#82ca9d" />
                                            <Bar dataKey="total_consultas" name="Total Consultas" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.comunidades === 'pie' && (
                                <div className="h-[400px] w-full mt-4 flex flex-col items-center">
                                    <h3 className="text-gray-700 font-semibold mb-2">Total de Consultas por Comunidad</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={reporteComunidades}
                                                dataKey="total_consultas"
                                                nameKey="nombre_comunidad"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label
                                            >
                                                {reporteComunidades.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Pacientes */}
                <TabsContent value="pacientes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-b border-gray-50/80 pb-4">
                            <CardTitle className="text-xl text-gray-800">Reporte de Pacientes</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('pacientes')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Pacientes', reportePacientes, [
                                        { key: 'cedula_paciente', label: 'Cédula' },
                                        { key: 'nombre_paciente', label: 'Nombre' },
                                        { key: 'apellido_paciente', label: 'Apellido' },
                                        { key: 'nombre_comunidad', label: 'Comunidad' },
                                        { key: 'estado', label: 'Estado', render: (item: ReportePacienteItem) => getEstadoNombre(item.estado || '') },
                                        { key: 'municipio', label: 'Municipio', render: (item: ReportePacienteItem) => getMunicipioNombre(item.estado || '', item.municipio || '') },
                                        { key: 'telefono_paciente', label: 'Teléfono' },
                                    ])}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf', 'Pacientes', reportePacientes, [
                                        { key: 'cedula_paciente', label: 'Cédula' },
                                        { key: 'nombre_paciente', label: 'Nombre' },
                                        { key: 'apellido_paciente', label: 'Apellido' },
                                        { key: 'nombre_comunidad', label: 'Comunidad' },
                                        { key: 'estado', label: 'Estado', render: (item: ReportePacienteItem) => getEstadoNombre(item.estado || '') },
                                        { key: 'telefono_paciente', label: 'Teléfono' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartViews.pacientes === 'table' && (
                                <DataTable
                                    data={reportePacientes}
                                    columns={[
                                        { key: 'cedula_paciente', header: 'Cédula', sortable: true },
                                        { key: 'nombre_comunidad', header: 'Comunidad', sortable: true },
                                        {
                                            key: 'estado',
                                            header: 'Estado',
                                            sortable: true,
                                            render: (item: ReportePacienteItem) => getEstadoNombre(item.estado || '')
                                        },
                                        {
                                            key: 'municipio',
                                            header: 'Municipio',
                                            sortable: true,
                                            render: (item: ReportePacienteItem) => getMunicipioNombre(item.estado || '', item.municipio || '')
                                        },
                                        { key: 'nombre_paciente', header: 'Nombre', sortable: true },
                                        { key: 'apellido_paciente', header: 'Apellido', sortable: true },
                                        {
                                            key: 'fecha_nacimiento',
                                            header: 'Fecha de Nac.',
                                            render: (p: ReportePacienteItem) =>
                                                p.fecha_nacimiento
                                                    ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                                    : '-',
                                            sortable: true,
                                        },
                                        { key: 'telefono_paciente', header: 'Teléfono' },
                                    ]}
                                    searchPlaceholder="Buscar paciente..."
                                />
                            )}
                            {chartViews.pacientes === 'bar' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageGroups} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="Cantidad de Pacientes" fill="#8884d8" label={{ position: 'top' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.pacientes === 'pie' && (
                                <div className="h-[400px] w-full mt-4 flex flex-col items-center">
                                    <h3 className="text-gray-700 font-semibold mb-2">Distribución por Grupos Etarios</h3>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={ageGroups}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(1)}%`}
                                            >
                                                {ageGroups.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Morbilidad */}
                <TabsContent value="morbilidad" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-b border-gray-50/80 pb-4">
                            <CardTitle className="text-xl text-gray-800">Reporte de Morbilidad</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('morbilidad')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Morbilidad', dataMorbilidad, [
                                        { key: 'codigo_enfermedad', label: 'Código' },
                                        { key: 'nombre_enfermedad', label: 'Enfermedad' },
                                        { key: 'tipo_patologia', label: 'Tipo' },
                                        { key: 'total_casos', label: 'Casos' },
                                        { key: 'porcentaje', label: '%', render: (item: ReporteMorbilidadItem) => `${item.porcentaje}%` }
                                    ])}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf', 'Morbilidad', dataMorbilidad, [
                                        { key: 'codigo_enfermedad', label: 'Código' },
                                        { key: 'nombre_enfermedad', label: 'Enfermedad' },
                                        { key: 'tipo_patologia', label: 'Tipo' },
                                        { key: 'total_casos', label: 'Casos' },
                                        { key: 'porcentaje', label: '%', render: (item: ReporteMorbilidadItem) => `${item.porcentaje}%` }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartViews.morbilidad === 'table' && (
                                <DataTable
                                    data={dataMorbilidad}
                                    columns={[
                                        { key: 'codigo_enfermedad', header: 'Código Enfermedad', sortable: true },
                                        { key: 'nombre_enfermedad', header: 'Nombre Enfermedad', sortable: true },
                                        { key: 'tipo_patologia', header: 'Tipo Patología', sortable: true },
                                        { key: 'total_casos', header: 'Total Casos', sortable: true },
                                        { key: 'pacientes_afectados', header: 'Pacientes Afectados', sortable: true },
                                        {
                                            key: 'porcentaje',
                                            header: '% del Total',
                                            render: (d: ReporteMorbilidadItem) => `${d.porcentaje}%`,
                                            sortable: true,
                                        },
                                        {
                                            key: 'ultima_consulta',
                                            header: 'Última Consulta',
                                            render: (d: ReporteMorbilidadItem) =>
                                                d.ultima_consulta
                                                    ? new Date(d.ultima_consulta).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                                    : '-',
                                            sortable: true,
                                        },
                                    ]}
                                    searchPlaceholder="Buscar tipo de morbilidad..."
                                />
                            )}
                            {chartViews.morbilidad === 'bar' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dataMorbilidad.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="nombre_enfermedad" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend verticalAlign="top" />
                                            <Bar dataKey="total_casos" name="Casos Reportados" fill="#ff7300" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.morbilidad === 'pie' && (
                                <div className="h-[500px] w-full mt-4 flex flex-col items-center">
                                    <h3 className="text-gray-700 font-semibold mb-2">
                                        Porcentaje de Casos por Enfermedad {dataMorbilidad.length > 10 ? '(Top 10)' : `(Top ${dataMorbilidad.length})`}
                                    </h3>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={dataMorbilidad.slice(0, 10)}
                                                dataKey="total_casos"
                                                nameKey="nombre_enfermedad"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={180}
                                                label={(props: any) => props.percent !== undefined ? `${(props.percent * 100).toFixed(1)}%` : ''}
                                            >
                                                {dataMorbilidad.slice(0, 10).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend layout="horizontal" verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Nueva sección de Distribución Etaria para Morbilidad */}
                            {(chartViews.morbilidad === 'bar' || chartViews.morbilidad === 'pie') && (
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Contexto: Distribución Etaria General</h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ageGroups}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar dataKey="value" name="Pacientes" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-sm text-gray-500 text-center mt-2 italic">
                                        Esta gráfica muestra la distribución de edad de todos los pacientes filtrados para contextualizar los casos de morbilidad.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Medicamentos */}
                <TabsContent value="medicamentos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-b border-gray-50/80 pb-4">
                            <CardTitle className="text-xl text-gray-800">Reporte de Medicamentos Entregados</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('medicamentos')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Medicamentos', reporteMedicamentos, [
                                        { key: 'codigo_medicamento', label: 'Código' },
                                        { key: 'nombre_medicamento', label: 'Medicamento' },
                                        { key: 'presentacion', label: 'Presentación' },
                                        { key: 'total_entregado', label: 'Total Entregado' }
                                    ])}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf', 'Medicamentos', reporteMedicamentos, [
                                        { key: 'codigo_medicamento', label: 'Código' },
                                        { key: 'nombre_medicamento', label: 'Medicamento' },
                                        { key: 'presentacion', label: 'Presentación' },
                                        { key: 'total_entregado', label: 'Total Entregado' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartViews.medicamentos === 'table' && (
                                <DataTable
                                    data={reporteMedicamentos}
                                    columns={[
                                        { key: 'codigo_medicamento', header: 'Código', sortable: true },
                                        { key: 'nombre_medicamento', header: 'Nombre Medicamento', sortable: true },
                                        { key: 'presentacion', header: 'Presentación', sortable: true },
                                        { key: 'total_entregado', header: 'Total Entregado', sortable: true },
                                    ]}
                                    searchPlaceholder="Buscar medicamento..."
                                />
                            )}
                            {chartViews.medicamentos === 'bar' && (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reporteMedicamentos.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="nombre_medicamento" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Legend verticalAlign="top" />
                                            <Bar dataKey="total_entregado" name="Cantidad Entregada" fill="#00C49F" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.medicamentos === 'pie' && (
                                <div className="h-[500px] w-full mt-4 flex flex-col items-center">
                                    <h3 className="text-gray-700 font-semibold mb-2">
                                        Distribución de Medicamentos Entregados {reporteMedicamentos.length > 10 ? '(Top 10)' : `(Top ${reporteMedicamentos.length})`}
                                    </h3>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={reporteMedicamentos.slice(0, 10)}
                                                dataKey="total_entregado"
                                                nameKey="nombre_medicamento"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={180}
                                                label={(props: any) => props.percent !== undefined ? `${(props.percent * 100).toFixed(1)}%` : ''}
                                            >
                                                {reporteMedicamentos.slice(0, 10).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend layout="horizontal" verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
