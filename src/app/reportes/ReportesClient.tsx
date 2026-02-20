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
import { DataTable } from '@/components/shared/DataTable';
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
        pacientes: 'table',
        morbilidad: 'table',
        medicamentos: 'table'
    });

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
        <div className="flex bg-gray-100 rounded-md p-1 items-center mr-2">
            <Button
                variant={chartViews[tab] === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'table' }))}
                title="Ver Tabla"
            >
                <TableIcon className="w-4 h-4" />
            </Button>
            <Button
                variant={chartViews[tab] === 'bar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'bar' }))}
                title="Gráfico de Barras"
            >
                <BarChartIcon className="w-4 h-4" />
            </Button>
            <Button
                variant={chartViews[tab] === 'pie' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartViews(prev => ({ ...prev, [tab]: 'pie' }))}
                title="Gráfico Circular"
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
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
                                <Button onClick={updateFilters} disabled={isPending} className="w-full">
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
            <Tabs defaultValue="abordajes" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="abordajes">Abordajes</TabsTrigger>
                    <TabsTrigger value="comunidades">Comunidades</TabsTrigger>
                    <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
                    <TabsTrigger value="morbilidad">Morbilidad</TabsTrigger>
                    <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                </TabsList>

                {/* Reporte Abordajes */}
                <TabsContent value="abordajes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Abordajes</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('abordajes')}
                                <Button
                                    variant="outline"
                                    size="sm"
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
                                        { key: 'codigo_abordaje', label: 'Código', sortable: true },
                                        {
                                            key: 'fecha_abordaje',
                                            label: 'Fecha',
                                            sortable: true,
                                            render: (item: ReporteAbordajeItem) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                        },
                                        { key: 'descripcion', label: 'Descripción' },
                                        { key: 'comunidades', label: 'Comunidades', sortable: true },
                                        { key: 'pacientes_atendidos', label: 'Pacientes Atendidos', sortable: true },
                                        { key: 'hora_inicio', label: 'Hora Inicio', sortable: true },
                                        { key: 'hora_fin', label: 'Hora Fin', sortable: true },
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
                <TabsContent value="comunidades">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Comunidades</CardTitle>
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
                                        { key: 'codigo_comunidad', label: 'Código', sortable: true },
                                        { key: 'nombre_comunidad', label: 'Nombre Comunidad', sortable: true },
                                        {
                                            key: 'estado',
                                            label: 'Estado',
                                            sortable: true,
                                            render: (item: ReporteComunidadItem) => getEstadoNombre(item.estado)
                                        },
                                        {
                                            key: 'municipio',
                                            label: 'Municipio',
                                            sortable: true,
                                            render: (item: ReporteComunidadItem) => getMunicipioNombre(item.estado, item.municipio)
                                        },
                                        { key: 'parroquia', label: 'Parroquia', sortable: true },
                                        { key: 'cantidad_habitantes', label: 'Habitantes', sortable: true },
                                        { key: 'cantidad_familias', label: 'Familias', sortable: true },
                                        {
                                            key: 'pacientes_tratados',
                                            label: 'Pacientes Tratados',
                                            sortable: true,
                                        },
                                        {
                                            key: 'abordajes_realizados',
                                            label: 'Abordajes Realizados',
                                            sortable: true,
                                        },
                                        { key: 'total_consultas', label: 'Consultas Realizadas', sortable: true },
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
                <TabsContent value="pacientes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Pacientes</CardTitle>
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
                                        { key: 'cedula_paciente', label: 'Cédula', sortable: true },
                                        { key: 'nombre_comunidad', label: 'Comunidad', sortable: true },
                                        {
                                            key: 'estado',
                                            label: 'Estado',
                                            sortable: true,
                                            render: (item: ReportePacienteItem) => getEstadoNombre(item.estado || '')
                                        },
                                        {
                                            key: 'municipio',
                                            label: 'Municipio',
                                            sortable: true,
                                            render: (item: ReportePacienteItem) => getMunicipioNombre(item.estado || '', item.municipio || '')
                                        },
                                        { key: 'nombre_paciente', label: 'Nombre', sortable: true },
                                        { key: 'apellido_paciente', label: 'Apellido', sortable: true },
                                        {
                                            key: 'fecha_nacimiento',
                                            label: 'Fecha de Nac.',
                                            render: (p: ReportePacienteItem) =>
                                                p.fecha_nacimiento
                                                    ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                                    : '-',
                                            sortable: true,
                                        },
                                        { key: 'telefono_paciente', label: 'Teléfono' },
                                    ]}
                                    searchPlaceholder="Buscar paciente..."
                                />
                            )}
                            {chartViews.pacientes === 'bar' && (
                                <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 border border-dashed rounded-md mt-4">
                                    <span className="text-gray-500">Gráfico no disponible para reporte a nivel de individuo</span>
                                </div>
                            )}
                            {chartViews.pacientes === 'pie' && (
                                <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 border border-dashed rounded-md mt-4">
                                    <span className="text-gray-500">Gráfico no disponible para reporte a nivel de individuo</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Morbilidad */}
                <TabsContent value="morbilidad">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Morbilidad</CardTitle>
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
                                        { key: 'codigo_enfermedad', label: 'Código Enfermedad', sortable: true },
                                        { key: 'nombre_enfermedad', label: 'Nombre Enfermedad', sortable: true },
                                        { key: 'tipo_patologia', label: 'Tipo Patología', sortable: true },
                                        { key: 'total_casos', label: 'Total Casos', sortable: true },
                                        { key: 'pacientes_afectados', label: 'Pacientes Afectados', sortable: true },
                                        {
                                            key: 'porcentaje',
                                            label: '% del Total',
                                            render: (d: ReporteMorbilidadItem) => `${d.porcentaje}%`,
                                            sortable: true,
                                        },
                                        {
                                            key: 'ultima_consulta',
                                            label: 'Última Consulta',
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
                                    <h3 className="text-gray-700 font-semibold mb-2">Porcentaje de Casos por Enfermedad (Top 10)</h3>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={dataMorbilidad.slice(0, 10)}
                                                dataKey="total_casos"
                                                nameKey="nombre_enfermedad"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={180}
                                                label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(1)}%` : ''}
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Medicamentos */}
                <TabsContent value="medicamentos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Medicamentos</CardTitle>
                            <div className="flex gap-2 items-center">
                                {renderChartControls('medicamentos')}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Medicamentos', reporteMedicamentos, [
                                        { key: 'codigo_medicamento', label: 'Código' },
                                        { key: 'nombre_medicamento', label: 'Medicamento' },
                                        { key: 'presentacion', label: 'Presentación' },
                                        { key: 'existencia', label: 'Existencia' }
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
                                        { key: 'existencia', label: 'Existencia' }
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
                                        { key: 'codigo_medicamento', label: 'Código', sortable: true },
                                        { key: 'nombre_medicamento', label: 'Nombre Medicamento', sortable: true },
                                        { key: 'presentacion', label: 'Presentación', sortable: true },
                                        { key: 'existencia', label: 'Existencia', sortable: true },
                                        { key: 'descripcion', label: 'Descripción' },
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
                                            <Bar dataKey="existencia" name="Existencia" fill="#00C49F" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            {chartViews.medicamentos === 'pie' && (
                                <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 border border-dashed rounded-md mt-4">
                                    <span className="text-gray-500">Gráfico circular no ideal para inventario. Intente gráfico de barras.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
