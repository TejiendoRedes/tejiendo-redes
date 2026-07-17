'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Search } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MINILOGO_B64 } from './logoBase64';

interface ReportesClientProps {
    comunidades: Array<{ codigo_comunidad: string; nombre_comunidad: string }>;
    reporteAbordajes: Array<{
        codigo_abordaje: string;
        fecha_abordaje: Date;
        descripcion: string;
        comunidades: number;
        pacientes_atendidos: number;
        hora_inicio: string;
        hora_fin: string;
    }>;
    reporteComunidades: Array<{
        codigo_comunidad: string;
        nombre_comunidad: string;
        estado: string;
        municipio: string;
        cantidad_habitantes: number;
        pacientes_tratados: number;
        abordajes_realizados: number;
        total_consultas: number;
    }>;
    reportePacientes: Array<{
        cedula_paciente: string;
        codigo_comunidad: string;
        nombre_comunidad: string;
        nombre_paciente: string;
        apellido_paciente: string;
        fecha_nacimiento: Date;
        direccion_paciente: string;
        telefono_paciente: string;
        correo_paciente: string;
    }>;
    dataMorbilidad: Array<{
        codigo_enfermedad: string;
        nombre_enfermedad: string;
        tipo_patologia: string;
        total_casos: number;
        pacientes_afectados: number;
        porcentaje: string;
        ultima_consulta: Date | null;
    }>;
    reporteMedicamentos: Array<{
        codigo_medicamento: string;
        nombre_medicamento: string;
        presentacion: string;
        existencia: number;
        descripcion: string;
    }>;
}

const COLORES_GRAFICA = ['#1e3a5f', '#2563eb', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#ec4899', '#0891b2'];

const TIPO_COMUNIDAD_MAP: Record<string, string> = {
    '1': 'Urbana', '2': 'Rural', '3': 'Indigena', '4': 'Base de Misiones',
};

export default function ReportesClient({
    comunidades, reporteAbordajes, reporteComunidades,
    reportePacientes, dataMorbilidad, reporteMedicamentos
}: ReportesClientProps) {

    const [abordajeFechaInicio, setAbordajeFechaInicio] = React.useState('');
    const [abordajeFechaFin, setAbordajeFechaFin] = React.useState('');
    const [abordajeEstado, setAbordajeEstado] = React.useState('todos');
    const [comunidadSearch, setComunidadSearch] = React.useState('');
    const [comunidadTipo, setComunidadTipo] = React.useState('todos');
    const [pacienteComunidad, setPacienteComunidad] = React.useState('todas');
    const [pacienteSexo, setPacienteSexo] = React.useState('todos');
    const [morbilidadTipo, setMorbilidadTipo] = React.useState('todos');
    const [medicamentoStock, setMedicamentoStock] = React.useState('todos');

    const abordajesFiltrados = reporteAbordajes.filter(a => {
        const fecha = new Date(a.fecha_abordaje);
        const desde = abordajeFechaInicio ? new Date(abordajeFechaInicio) : null;
        const hasta = abordajeFechaFin ? new Date(abordajeFechaFin) : null;
        if (desde && fecha < desde) return false;
        if (hasta && fecha > hasta) return false;
        if (abordajeEstado !== 'todos' && (a as any).estado !== abordajeEstado) return false;
        return true;
    });

    const comunidadesFiltradas = reporteComunidades.filter(c => {
        const matchNombre = c.nombre_comunidad.toLowerCase().includes(comunidadSearch.toLowerCase());
        const matchTipo = comunidadTipo === 'todos' || (c as any).tipoComunidad === comunidadTipo;
        return matchNombre && matchTipo;
    });

    const pacientesFiltrados = reportePacientes.filter(p => {
        if (pacienteComunidad !== 'todas' && p.codigo_comunidad !== pacienteComunidad) return false;
        return true;
    });

    const morbilidadFiltrada = dataMorbilidad
        .filter(m => morbilidadTipo === 'todos' || m.tipo_patologia === morbilidadTipo)
        .sort((a, b) => Number(b.total_casos) - Number(a.total_casos));

    const tiposPatologia = [...new Set(dataMorbilidad.map(m => m.tipo_patologia).filter(Boolean))];

    const datosGraficaMorbilidad = morbilidadFiltrada
        .filter(m => Number(m.total_casos) > 0)
        .slice(0, 8)
        .map(m => ({
            nombre: m.nombre_enfermedad.length > 15 ? m.nombre_enfermedad.substring(0, 15) + '...' : m.nombre_enfermedad,
            casos: Number(m.total_casos),
        }));

    const medicamentosFiltrados = reporteMedicamentos.filter(m => {
        if (medicamentoStock === 'critico') return m.existencia < 20;
        if (medicamentoStock === 'medio') return m.existencia >= 20 && m.existencia < 50;
        if (medicamentoStock === 'optimo') return m.existencia >= 50;
        return true;
    });

    // CSV real
    const generarCSV = (tabName: string) => {
        let headers: string[] = [];
        let rows: string[][] = [];

        if (tabName === 'Abordajes') {
            headers = ['Codigo', 'Fecha', 'Descripcion', 'Comunidades', 'Pacientes Atendidos', 'Hora Inicio', 'Hora Fin'];
            rows = abordajesFiltrados.map(a => [
                a.codigo_abordaje,
                new Date(a.fecha_abordaje).toLocaleDateString('es-VE'),
                '"' + a.descripcion + '"',
                String(a.comunidades),
                String(a.pacientes_atendidos),
                a.hora_inicio || '-',
                a.hora_fin || '-',
            ]);
        } else if (tabName === 'Comunidades') {
            headers = ['Nombre Comunidad', 'Estado', 'Municipio', 'Habitantes', 'Pacientes Tratados', 'Abordajes Realizados', 'Consultas Realizadas'];
            rows = comunidadesFiltradas.map(c => [
                '"' + c.nombre_comunidad + '"',
                c.estado, c.municipio,
                String(c.cantidad_habitantes),
                String(c.pacientes_tratados),
                String(c.abordajes_realizados),
                String(c.total_consultas),
            ]);
        } else if (tabName === 'Pacientes') {
            headers = ['Cedula', 'Nombre', 'Apellido', 'Comunidad', 'Fecha Nacimiento', 'Telefono', 'Correo'];
            rows = pacientesFiltrados.map(p => [
                p.cedula_paciente, p.nombre_paciente, p.apellido_paciente,
                '"' + p.nombre_comunidad + '"',
                p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE') : '-',
                p.telefono_paciente, p.correo_paciente,
            ]);
        } else if (tabName === 'Morbilidad') {
            headers = ['Enfermedad', 'Tipo Patologia', 'Total Casos', 'Pacientes Afectados', 'Porcentaje', 'Ultima Consulta'];
            rows = morbilidadFiltrada.map(m => [
                '"' + m.nombre_enfermedad + '"',
                m.tipo_patologia,
                String(m.total_casos),
                String(m.pacientes_afectados),
                m.porcentaje + '%',
                m.ultima_consulta ? new Date(m.ultima_consulta).toLocaleDateString('es-VE') : '-',
            ]);
        } else if (tabName === 'Medicamentos') {
            headers = ['Codigo', 'Nombre', 'Presentacion', 'Existencia', 'Estado Stock', 'Descripcion'];
            rows = medicamentosFiltrados.map(m => [
                m.codigo_medicamento,
                '"' + m.nombre_medicamento + '"',
                '"' + m.presentacion + '"',
                String(m.existencia),
                m.existencia < 20 ? 'CRITICO' : m.existencia < 50 ? 'MEDIO' : 'OPTIMO',
                '"' + m.descripcion + '"',
            ]);
        }

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fecha = new Date().toISOString().split('T')[0];
        link.download = 'reporte-' + tabName.toLowerCase() + '-' + fecha + '.csv';
        link.click();
        URL.revokeObjectURL(url);
        toast.success('CSV de ' + tabName + ' descargado correctamente');
    };

    // PDF con logo
    const generarPDF = (tabName: string) => {
        const doc = new jsPDF();
        const fechaGeneracion = new Date().toLocaleDateString('es-VE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const colorPrimario: [number, number, number] = [30, 58, 95];
        const colorSecundario: [number, number, number] = [37, 99, 235];

        doc.setFillColor(...colorPrimario);
        doc.rect(0, 0, 210, 30, 'F');
        doc.addImage(MINILOGO_B64, 'PNG', 5, 2, 26, 26);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text('Sistema de Abordajes', 35, 11);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Fundacion Tejiendo Redes - Gestion de Salud Comunitaria', 35, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de ' + tabName, 196, 11, { align: 'right' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Generado: ' + fechaGeneracion, 196, 18, { align: 'right' });
        doc.setDrawColor(...colorSecundario);
        doc.setLineWidth(0.5);
        doc.line(14, 34, 196, 34);
        let startY = 38;

        const headStyles = { fillColor: colorPrimario, textColor: 255 as any, fontStyle: 'bold' as any, fontSize: 8 };
        const footStyles = { fillColor: colorSecundario, textColor: 255 as any, fontStyle: 'bold' as any, fontSize: 8 };
        const altRows = { fillColor: [240, 244, 255] as any };
        const baseStyles = { fontSize: 8, cellPadding: 3 };

        if (tabName === 'Abordajes') {
            autoTable(doc, {
                startY,
                head: [['Codigo', 'Fecha', 'Descripcion', 'Comunidades', 'Pacientes', 'Hora Inicio', 'Hora Fin']],
                body: abordajesFiltrados.map(a => [
                    a.codigo_abordaje,
                    new Date(a.fecha_abordaje).toLocaleDateString('es-VE'),
                    a.descripcion,
                    String(a.comunidades),
                    String(a.pacientes_atendidos),
                    a.hora_inicio || '-',
                    a.hora_fin || '-',
                ]),
                foot: [['TOTAL', '', abordajesFiltrados.length + ' abordajes', '',
                    String(abordajesFiltrados.reduce((s, a) => s + (a.pacientes_atendidos || 0), 0)), '', '']],
                headStyles, footStyles, alternateRowStyles: altRows, styles: baseStyles,
                columnStyles: { 2: { cellWidth: 50 } },
            });
        } else if (tabName === 'Comunidades') {
            autoTable(doc, {
                startY,
                head: [['Nombre Comunidad', 'Estado', 'Municipio', 'Habitantes', 'Pacientes', 'Abordajes', 'Consultas']],
                body: comunidadesFiltradas.map(c => [
                    c.nombre_comunidad, c.estado, c.municipio,
                    String(c.cantidad_habitantes), String(c.pacientes_tratados),
                    String(c.abordajes_realizados), String(c.total_consultas),
                ]),
                foot: [['TOTAL: ' + comunidadesFiltradas.length + ' comunidades', '', '',
                    String(comunidadesFiltradas.reduce((s, c) => s + (c.cantidad_habitantes || 0), 0)),
                    String(comunidadesFiltradas.reduce((s, c) => s + (c.pacientes_tratados || 0), 0)),
                    String(comunidadesFiltradas.reduce((s, c) => s + (c.abordajes_realizados || 0), 0)),
                    String(comunidadesFiltradas.reduce((s, c) => s + (c.total_consultas || 0), 0)),
                ]],
                headStyles, footStyles, alternateRowStyles: altRows, styles: baseStyles,
            });
        } else if (tabName === 'Pacientes') {
            autoTable(doc, {
                startY,
                head: [['Cedula', 'Nombre', 'Apellido', 'Comunidad', 'Fecha Nac.', 'Telefono']],
                body: pacientesFiltrados.map(p => [
                    p.cedula_paciente, p.nombre_paciente, p.apellido_paciente,
                    p.nombre_comunidad,
                    p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE') : '-',
                    p.telefono_paciente,
                ]),
                foot: [['TOTAL: ' + pacientesFiltrados.length + ' pacientes', '', '', '', '', '']],
                headStyles, footStyles, alternateRowStyles: altRows, styles: baseStyles,
            });
        } else if (tabName === 'Morbilidad') {
            autoTable(doc, {
                startY,
                head: [['Enfermedad', 'Tipo Patologia', 'Total Casos', 'Pacientes Afectados', '% del Total', 'Ultima Consulta']],
                body: morbilidadFiltrada.map(m => [
                    m.nombre_enfermedad, m.tipo_patologia,
                    String(m.total_casos), String(m.pacientes_afectados),
                    m.porcentaje + '%',
                    m.ultima_consulta ? new Date(m.ultima_consulta).toLocaleDateString('es-VE') : '-',
                ]),
                foot: [['TOTAL: ' + morbilidadFiltrada.length + ' enfermedades', '',
                    String(morbilidadFiltrada.reduce((s, m) => s + Number(m.total_casos || 0), 0)),
                    String(morbilidadFiltrada.reduce((s, m) => s + Number(m.pacientes_afectados || 0), 0)),
                    '', '']],
                headStyles, footStyles, alternateRowStyles: altRows, styles: baseStyles,
            });
        } else if (tabName === 'Medicamentos') {
            autoTable(doc, {
                startY,
                head: [['Codigo', 'Nombre', 'Presentacion', 'Existencia', 'Estado Stock', 'Descripcion']],
                body: medicamentosFiltrados.map(m => [
                    m.codigo_medicamento, m.nombre_medicamento, m.presentacion,
                    String(m.existencia),
                    m.existencia < 20 ? 'CRITICO' : m.existencia < 50 ? 'MEDIO' : 'OPTIMO',
                    m.descripcion,
                ]),
                foot: [['TOTAL: ' + medicamentosFiltrados.length + ' medicamentos', '', '', '', '', '']],
                headStyles, footStyles, alternateRowStyles: altRows, styles: baseStyles,
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 4) {
                        if (data.cell.raw === 'CRITICO') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
                        else if (data.cell.raw === 'MEDIO') { data.cell.styles.textColor = [180, 83, 9]; }
                        else { data.cell.styles.textColor = [22, 101, 52]; }
                    }
                },
            });
        }

        const totalPaginas = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            doc.setPage(i);
            doc.setFillColor(...colorPrimario);
            doc.rect(0, 285, 210, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text('Fundacion Tejiendo Redes - Sistema de Abordajes', 14, 292);
            doc.text('Pagina ' + i + ' de ' + totalPaginas, 196, 292, { align: 'right' });
        }

        const fecha = new Date().toISOString().split('T')[0];
        doc.save('reporte-' + tabName.toLowerCase() + '-' + fecha + '.pdf');
        toast.success('PDF de ' + tabName + ' generado correctamente');
    };

    return (
        <>
            <Tabs defaultValue="abordajes" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="abordajes">Abordajes</TabsTrigger>
                    <TabsTrigger value="comunidades">Comunidades</TabsTrigger>
                    <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
                    <TabsTrigger value="morbilidad">Morbilidad</TabsTrigger>
                    <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="abordajes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Abordajes</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => generarCSV('Abordajes')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                                <Button variant="outline" size="sm" onClick={() => generarPDF('Abordajes')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-1"><Label>Fecha Inicio</Label><Input type="date" value={abordajeFechaInicio} onChange={e => setAbordajeFechaInicio(e.target.value)} /></div>
                                <div className="space-y-1"><Label>Fecha Fin</Label><Input type="date" value={abordajeFechaFin} onChange={e => setAbordajeFechaFin(e.target.value)} /></div>
                                <div className="space-y-1">
                                    <Label>Estado</Label>
                                    <Select value={abordajeEstado} onValueChange={setAbordajeEstado}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="Planificado">Planificado</SelectItem>
                                            <SelectItem value="En Curso">En Curso</SelectItem>
                                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DataTable data={abordajesFiltrados} columns={[
                                { key: 'codigo_abordaje', label: 'Codigo', sortable: true },
                                { key: 'fecha_abordaje', label: 'Fecha', sortable: true, render: (item: any) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE') },
                                { key: 'descripcion', label: 'Descripcion' },
                                { key: 'comunidades', label: 'Comunidades', sortable: true },
                                { key: 'pacientes_atendidos', label: 'Pacientes Atendidos', sortable: true },
                                { key: 'hora_inicio', label: 'Hora Inicio' },
                                { key: 'hora_fin', label: 'Hora Fin' },
                            ]} searchPlaceholder="Buscar abordaje..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comunidades">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Comunidades</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => generarCSV('Comunidades')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                                <Button variant="outline" size="sm" onClick={() => generarPDF('Comunidades')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-1">
                                    <Label>Buscar por nombre</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input type="text" placeholder="Ej: La Esperanza..." value={comunidadSearch} onChange={e => setComunidadSearch(e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Tipo de comunidad</Label>
                                    <Select value={comunidadTipo} onValueChange={setComunidadTipo}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos los tipos</SelectItem>
                                            <SelectItem value="1">Urbana</SelectItem>
                                            <SelectItem value="2">Rural</SelectItem>
                                            <SelectItem value="3">Indigena</SelectItem>
                                            <SelectItem value="4">Base de Misiones</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DataTable data={comunidadesFiltradas} columns={[
                                { key: 'nombre_comunidad', label: 'Nombre Comunidad', sortable: true },
                                { key: 'estado', label: 'Estado', sortable: true },
                                { key: 'municipio', label: 'Municipio', sortable: true },
                                { key: 'cantidad_habitantes', label: 'Habitantes', sortable: true },
                                { key: 'pacientes_tratados', label: 'Pacientes Tratados', sortable: true },
                                { key: 'abordajes_realizados', label: 'Abordajes Realizados', sortable: true },
                                { key: 'total_consultas', label: 'Consultas Realizadas', sortable: true },
                            ]} searchPlaceholder="Buscar comunidad..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pacientes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Pacientes</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => generarCSV('Pacientes')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                                <Button variant="outline" size="sm" onClick={() => generarPDF('Pacientes')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-1">
                                    <Label>Comunidad</Label>
                                    <Select value={pacienteComunidad} onValueChange={setPacienteComunidad}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todas">Todas las comunidades</SelectItem>
                                            {comunidades.map(c => (<SelectItem key={c.codigo_comunidad} value={c.codigo_comunidad}>{c.nombre_comunidad}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Sexo</Label>
                                    <Select value={pacienteSexo} onValueChange={setPacienteSexo}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="M">Masculino</SelectItem>
                                            <SelectItem value="F">Femenino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DataTable data={pacientesFiltrados} columns={[
                                { key: 'cedula_paciente', label: 'Cedula', sortable: true },
                                { key: 'nombre_comunidad', label: 'Comunidad', sortable: true },
                                { key: 'nombre_paciente', label: 'Nombre', sortable: true },
                                { key: 'apellido_paciente', label: 'Apellido', sortable: true },
                                { key: 'fecha_nacimiento', label: 'Fecha Nac.', render: (p: any) => p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE') : '-', sortable: true },
                                { key: 'telefono_paciente', label: 'Telefono' },
                            ]} searchPlaceholder="Buscar paciente..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="morbilidad">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Morbilidad</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => generarCSV('Morbilidad')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                                <Button variant="outline" size="sm" onClick={() => generarPDF('Morbilidad')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Label>Filtrar por tipo de patologia</Label>
                                <Select value={morbilidadTipo} onValueChange={setMorbilidadTipo}>
                                    <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los tipos</SelectItem>
                                        {tiposPatologia.map(tipo => (<SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {datosGraficaMorbilidad.length > 0 && (
                                <Card className="border border-gray-100">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-gray-600">Enfermedades mas frecuentes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={datosGraficaMorbilidad} layout="vertical" margin={{ left: 10, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Bar dataKey="casos" radius={[0, 6, 6, 0]}>
                                                    {datosGraficaMorbilidad.map((_, index) => (
                                                        <Cell key={'cell-' + index} fill={COLORES_GRAFICA[index % COLORES_GRAFICA.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}
                            <DataTable data={morbilidadFiltrada} columns={[
                                { key: 'nombre_enfermedad', label: 'Nombre Enfermedad', sortable: true },
                                { key: 'tipo_patologia', label: 'Tipo Patologia', sortable: true },
                                { key: 'total_casos', label: 'Total Casos', sortable: true },
                                { key: 'pacientes_afectados', label: 'Pacientes Afectados', sortable: true },
                                { key: 'porcentaje', label: '% del Total', render: (d: any) => d.porcentaje + '%', sortable: true },
                                { key: 'ultima_consulta', label: 'Ultima Consulta', render: (d: any) => d.ultima_consulta ? new Date(d.ultima_consulta).toLocaleDateString('es-VE') : '-' },
                            ]} searchPlaceholder="Buscar enfermedad..." />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medicamentos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Medicamentos</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => generarCSV('Medicamentos')}><Download className="w-4 h-4 mr-2" /> CSV</Button>
                                <Button variant="outline" size="sm" onClick={() => generarPDF('Medicamentos')}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Label>Filtrar por estado de stock</Label>
                                <Select value={medicamentoStock} onValueChange={setMedicamentoStock}>
                                    <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="critico">Critico (menos de 20)</SelectItem>
                                        <SelectItem value="medio">Medio (20 a 49)</SelectItem>
                                        <SelectItem value="optimo">Optimo (50 o mas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DataTable data={medicamentosFiltrados} columns={[
                                { key: 'codigo_medicamento', label: 'Codigo', sortable: true },
                                { key: 'nombre_medicamento', label: 'Nombre Medicamento', sortable: true },
                                { key: 'presentacion', label: 'Presentacion', sortable: true },
                                {
                                    key: 'existencia', label: 'Existencia', sortable: true,
                                    render: (m: any) => (
                                        <span className={m.existencia < 20 ? 'text-red-600 font-bold' : m.existencia < 50 ? 'text-yellow-600 font-bold' : 'text-green-600'}>
                                            {m.existencia} {m.existencia < 20 ? '⚠️' : ''}
                                        </span>
                                    )
                                },
                                { key: 'descripcion', label: 'Descripcion' },
                            ]} searchPlaceholder="Buscar medicamento..." />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}
