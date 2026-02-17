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
import { Download, FileText, Filter, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { toast } from 'sonner';
import { utils, write, WORKBOOK_APPEND } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getEstadoNombre, getMunicipioNombre } from '@/data/venezuela-location';

interface ReportesClientProps {
    comunidades: Array<{ codigo_comunidad: string; nombre_comunidad: string }>;
    reporteAbordajes: Array<{
        codigo_abordaje: string;
        fecha_abordaje: Date;
        descripcion: string;
        comunidades: string;
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
        nombre_comunidad: string | null;
        nombre_paciente: string;
        apellido_paciente: string;
        fecha_nacimiento: Date | null;
        direccion_paciente: string | null;
        telefono_paciente: string | null;
        correo_paciente: string | null;
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
        descripcion: string | null;
    }>;
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

    const updateFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (fechaInicio) params.set('fechaInicio', fechaInicio);
        else params.delete('fechaInicio');

        if (fechaFin) params.set('fechaFin', fechaFin);
        else params.delete('fechaFin');

        if (comunidadFiltro && comunidadFiltro !== 'todas') params.set('codigoComunidad', comunidadFiltro);
        else params.delete('codigoComunidad');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleExport = (format: 'csv' | 'pdf', tabName: string, data: any[], columns: any[]) => {
        try {
            if (format === 'csv') {
                const worksheet = utils.json_to_sheet(data);
                const workbook = utils.book_new();
                utils.book_append_sheet(workbook, worksheet, tabName);

                // Generar nombre de archivo
                const date = new Date().toLocaleDateString('es-VE').replace(/\//g, '-');
                write(workbook, { bookType: 'csv', type: 'buffer' });
                // @ts-ignore
                import('xlsx').then(xlsx => {
                    xlsx.writeFile(workbook, `Reporte_${tabName}_${date}.csv`);
                });
                toast.success(`Exportado correctamente a CSV`);
            } else {
                const doc = new jsPDF();

                // Título
                doc.setFontSize(18);
                doc.text(`Reporte de ${tabName}`, 14, 22);
                doc.setFontSize(11);
                doc.text(`Generado el: ${new Date().toLocaleDateString('es-VE')}`, 14, 30);

                // Filtros aplicados
                let yPos = 38;
                if (fechaInicio || fechaFin || comunidadFiltro !== 'todas') {
                    doc.setFontSize(10);
                    doc.text('Filtros aplicados:', 14, yPos);
                    yPos += 5;
                    if (fechaInicio) doc.text(`Desde: ${new Date(fechaInicio).toLocaleDateString('es-VE')}`, 20, yPos);
                    if (fechaFin) doc.text(`Hasta: ${new Date(fechaFin).toLocaleDateString('es-VE')}`, 70, yPos);
                    yPos += 5;
                    if (comunidadFiltro !== 'todas') {
                        const com = comunidades.find(c => c.codigo_comunidad === comunidadFiltro);
                        doc.text(`Comunidad: ${com?.nombre_comunidad || comunidadFiltro}`, 20, yPos);
                    }
                    yPos += 10;
                }

                // Datos
                const tableColumn = columns.map(c => c.label);
                const tableRows = data.map(item => {
                    return columns.map(col => {
                        if (col.key === 'estado') {
                            return getEstadoNombre(item[col.key]);
                        }
                        if (col.key === 'municipio') {
                            return getMunicipioNombre(item.estado, item[col.key]);
                        }
                        if (col.render) {
                            // Si tiene render, tratamos de ejecutarlo o obtener el valor raw
                            // Esta es una simplificación, idealmente refactorizamos render para aceptar strings puros
                            return String(item[col.key]);
                        }
                        return String(item[col.key] || '-');
                    });
                });

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: yPos,
                });

                doc.save(`Reporte_${tabName}_${new Date().toISOString().split('T')[0]}.pdf`);
                toast.success(`Exportado correctamente a PDF`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al exportar');
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div className="space-y-2">
                                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                                <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fechaFin">Fecha Fin</Label>
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comunidad">Comunidad</Label>
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
                        </div>
                        <Button onClick={updateFilters} disabled={isPending} className="min-w-[120px]">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Aplicar
                        </Button>
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
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Abordajes', reporteAbordajes, [
                                        { key: 'codigo_abordaje', label: 'Código' },
                                        { key: 'fecha_abordaje', label: 'Fecha' },
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
                                        { key: 'fecha_abordaje', label: 'Fecha' },
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
                            <DataTable
                                data={reporteAbordajes}
                                columns={[
                                    { key: 'codigo_abordaje', label: 'Código', sortable: true },
                                    {
                                        key: 'fecha_abordaje',
                                        label: 'Fecha',
                                        sortable: true,
                                        render: (item: any) => new Date(item.fecha_abordaje).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                    },
                                    { key: 'descripcion', label: 'Descripción' },
                                    { key: 'comunidades', label: 'Comunidades', sortable: true },
                                    { key: 'pacientes_atendidos', label: 'Pacientes Atendidos', sortable: true },
                                    { key: 'hora_inicio', label: 'Hora Inicio', sortable: true },
                                    { key: 'hora_fin', label: 'Hora Fin', sortable: true },
                                ]}
                                searchPlaceholder="Buscar abordaje..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Comunidades */}
                <TabsContent value="comunidades">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Comunidades</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Comunidades', reporteComunidades, [
                                        { key: 'codigo_comunidad', label: 'Código' },
                                        { key: 'nombre_comunidad', label: 'Nombre' },
                                        { key: 'estado', label: 'Estado' },
                                        { key: 'municipio', label: 'Municipio' },
                                        { key: 'cantidad_habitantes', label: 'Habitantes' },
                                        { key: 'pacientes_tratados', label: 'Pacientes' }
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
                                        { key: 'estado', label: 'Estado' },
                                        { key: 'municipio', label: 'Municipio' },
                                        { key: 'cantidad_habitantes', label: 'Habitantes' },
                                        { key: 'pacientes_tratados', label: 'Pacientes' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={reporteComunidades}
                                columns={[
                                    { key: 'codigo_comunidad', label: 'Código', sortable: true },
                                    { key: 'nombre_comunidad', label: 'Nombre Comunidad', sortable: true },
                                    {
                                        key: 'estado',
                                        label: 'Estado',
                                        sortable: true,
                                        render: (item: any) => getEstadoNombre(item.estado)
                                    },
                                    {
                                        key: 'municipio',
                                        label: 'Municipio',
                                        sortable: true,
                                        render: (item: any) => getMunicipioNombre(item.estado, item.municipio)
                                    },
                                    { key: 'cantidad_habitantes', label: 'Habitantes', sortable: true },
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Pacientes */}
                <TabsContent value="pacientes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Pacientes</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Pacientes', reportePacientes, [
                                        { key: 'cedula_paciente', label: 'Cédula' },
                                        { key: 'nombre_paciente', label: 'Nombre' },
                                        { key: 'apellido_paciente', label: 'Apellido' },
                                        { key: 'nombre_comunidad', label: 'Comunidad' },
                                        { key: 'telefono_paciente', label: 'Teléfono' }
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
                                        { key: 'telefono_paciente', label: 'Teléfono' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={reportePacientes}
                                columns={[
                                    { key: 'cedula_paciente', label: 'Cédula', sortable: true },
                                    { key: 'nombre_comunidad', label: 'Comunidad', sortable: true },
                                    { key: 'nombre_paciente', label: 'Nombre', sortable: true },
                                    { key: 'apellido_paciente', label: 'Apellido', sortable: true },
                                    {
                                        key: 'fecha_nacimiento',
                                        label: 'Fecha de Nacimiento',
                                        render: (p: any) =>
                                            p.fecha_nacimiento
                                                ? new Date(p.fecha_nacimiento).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                                : '-',
                                        sortable: true,
                                    },
                                    { key: 'direccion_paciente', label: 'Dirección' },
                                    { key: 'telefono_paciente', label: 'Teléfono' },
                                    { key: 'correo_paciente', label: 'Correo' },
                                ]}
                                searchPlaceholder="Buscar paciente..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Morbilidad */}
                <TabsContent value="morbilidad">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Morbilidad</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('csv', 'Morbilidad', dataMorbilidad, [
                                        { key: 'codigo_enfermedad', label: 'Código' },
                                        { key: 'nombre_enfermedad', label: 'Enfermedad' },
                                        { key: 'tipo_patologia', label: 'Tipo' },
                                        { key: 'total_casos', label: 'Casos' },
                                        { key: 'porcentaje', label: '%' }
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
                                        { key: 'porcentaje', label: '%' }
                                    ])}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                        label: 'Porcentaje del Total',
                                        render: (d: any) => `${d.porcentaje}%`,
                                        sortable: true,
                                    },
                                    {
                                        key: 'ultima_consulta',
                                        label: 'Última Consulta',
                                        render: (d: any) =>
                                            d.ultima_consulta
                                                ? new Date(d.ultima_consulta).toLocaleDateString('es-VE', { timeZone: 'UTC' })
                                                : '-',
                                        sortable: true,
                                    },
                                ]}
                                searchPlaceholder="Buscar tipo de morbilidad..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reporte Medicamentos */}
                <TabsContent value="medicamentos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Reporte de Medicamentos</CardTitle>
                            <div className="flex gap-2">
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
