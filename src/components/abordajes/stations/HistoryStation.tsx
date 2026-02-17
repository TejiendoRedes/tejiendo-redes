'use client';

import React, { useMemo } from 'react';
import { Users, FileText, Pill, MapPin, Download, FileDown, Clock, Stethoscope, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface HistoryStationProps {
    abordaje: any;
}

export function HistoryStation({ abordaje }: HistoryStationProps) {
    const totalComunidades = abordaje.comunidades?.length || 0;
    const totalTejedores = abordaje.tejedores?.length || 0;
    const totalConsultas = abordaje.consultas?.length || 0;
    const totalEntregas = abordaje.medicamentos_entregados?.length || 0;

    // Consolidate all interactions for this abordaje
    const interactions = useMemo(() => {
        const items = [
            ...(abordaje.consultas || []).map((c: any) => ({
                id: c.codigoConsulta,
                type: 'consulta',
                patient: c.nombrePaciente || c.cedulaPaciente,
                patientId: c.cedulaPaciente,
                professional: c.nombreMedico || c.cedulaMedico,
                service: 'Consulta Médica',
                description: c.motivoConsulta,
                date: abordaje.fechaAbordaje
            })),
            ...(abordaje.medicamentos_entregados || []).map((m: any) => ({
                id: m.codigoMedicamento,
                type: 'medicamento',
                patient: m.nombrePaciente || m.cedulaPaciente,
                patientId: m.cedulaPaciente,
                professional: 'Farmacia / Logística',
                service: `Entrega: ${m.nombreMedicamento}`,
                description: `Cantidad: ${m.cantidadEntregada} - ${m.indicaciones || ''}`,
                date: m.fechaEntrega || abordaje.fechaAbordaje
            }))
        ];
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [abordaje]);

    const handleExportCSV = () => {
        const data = interactions.map(item => ({
            ID: item.id,
            Fecha: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            Tipo: item.type === 'consulta' ? 'Consulta' : 'Medicamento',
            Paciente: item.patient,
            Cédula: item.patientId,
            Profesional: item.professional,
            Servicio: item.service,
            Descripción: item.description
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Resumen_Abordaje");
        XLSX.writeFile(wb, `Resumen_${abordaje.codigoAbordaje}.xlsx`);
        toast.success('Excel exportado correctamente');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF() as any;
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(30, 64, 175);
        doc.text("RESUMEN DE JORNADA / ABORDAJE", pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fundación Tejiendo Redes - Código: ${abordaje.codigoAbordaje}`, pageWidth / 2, 27, { align: 'center' });
        doc.line(20, 32, pageWidth - 20, 32);

        // Abordaje Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Abordaje: ${abordaje.descripcion || 'Sin descripción'}`, 20, 42);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${format(new Date(abordaje.fechaAbordaje), 'dd/MM/yyyy')}`, 20, 48);
        doc.text(`Tipo: ${abordaje.tipoAbordaje || 'Normal'}`, 20, 54);
        doc.text(`Estado: ${abordaje.estatus || 'N/A'}`, 20, 60);

        // Stats Summary
        doc.setFontSize(10);
        doc.text(`Total Pacientes: ${totalConsultas + totalEntregas}`, 140, 48);
        doc.text(`Escogidas: ${totalComunidades} Comunidades`, 140, 54);
        doc.text(`Personal: ${totalTejedores} Tejedores`, 140, 60);

        // Interactions Table
        const tableData = interactions.map(item => [
            item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            item.patient,
            item.type === 'consulta' ? 'Consulta' : 'Medicamento',
            `${item.professional}\n${item.service}`,
            item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '')
        ]);

        doc.autoTable({
            startY: 70,
            head: [['Fecha', 'Paciente', 'Tipo', 'Profesional / Servicio', 'Resumen']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillStyle: [30, 64, 175] },
            styles: { fontSize: 8 }
        });

        doc.save(`Resumen_${abordaje.codigoAbordaje}.pdf`);
        toast.success('PDF exportado correctamente');
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Historial y Resumen Profesional</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Vista consolidada de todo lo ocurrido en este abordaje
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-dashed" onClick={handleExportCSV}>
                        <Download className="w-4 h-4" />
                        Exportar Excel
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-dashed text-red-600 hover:text-red-710" onClick={handleExportPDF}>
                        <FileDown className="w-4 h-4" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* ESTADÍSTICAS GENERALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Comunidades</p>
                                <span className="text-3xl font-black text-blue-700">{totalComunidades}</span>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-green-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Tejedores</p>
                                <span className="text-3xl font-black text-green-700">{totalTejedores}</span>
                            </div>
                            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Consultas</p>
                                <span className="text-3xl font-black text-purple-700">{totalConsultas}</span>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-orange-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Entregas</p>
                                <span className="text-3xl font-black text-orange-700">{totalEntregas}</span>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                                <Pill className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TABLA CONSOLIDADA */}
            <Card className="border-none shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        Registro de Interacciones de la Jornada
                    </h3>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                        {interactions.length} registros totales
                    </Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-tighter">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Tipo Serv.</th>
                                <th className="px-6 py-4">Responsable / Detalle</th>
                                <th className="px-6 py-4 text-right">Hora/Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {interactions.length > 0 ? (
                                interactions.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{item.patient}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{item.patientId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {item.type === 'consulta' ? (
                                                    <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-200">CONSULTA</Badge>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-200">MEDICAMENTO</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-700 font-medium line-clamp-1 group-hover:line-clamp-none">
                                                {item.service}
                                            </p>
                                            <p className="text-[10px] text-gray-400 italic">
                                                Por: {item.professional}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-gray-500 font-mono text-[11px]">
                                                <Clock className="w-3 h-3" />
                                                {item.date ? format(new Date(item.date), 'HH:mm') : '--:--'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <FileText className="w-12 h-12" />
                                            <p className="font-bold">No hay interacciones registradas aún</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* DETALLES ADICIONALES */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Información Adicional del Registro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Planificación Estimada</p>
                                <p className="font-semibold text-gray-700">{abordaje.participantesEstimados || 'No especificado'} participantes</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoría de Abordaje</p>
                                <p className="font-semibold text-gray-700">{abordaje.tipoAbordaje || 'No especificado'}</p>
                            </div>
                        </div>

                        {abordaje.recursosAdicionales && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Briefcase className="w-3 h-3" /> Recursos Logísticos:
                                </p>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    {abordaje.recursosAdicionales}
                                </p>
                            </div>
                        )}

                        {abordaje.notas && (
                            <div className="col-span-full bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                                <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-2">Resumen Narrativo / Observaciones:</p>
                                <p className="text-gray-800 font-medium italic">
                                    "{abordaje.notas}"
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
