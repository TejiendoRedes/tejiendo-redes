'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    User,
    MapPin,
    Phone,
    Calendar,
    Loader2,
    Edit,
    FileText,
    Pill,
    Download,
    FileDown,
    Activity,
    ShieldCheck,
    Stethoscope
} from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { getEntityDetails } from '@/queries/global-search-actions';;
import { EntityDetails } from '@/types/app-types';
import { getPatientHistory, getPatientMedicationHistory } from '@/queries/consultas-actions';;
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function PacienteDetallePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [pacienteData, setPacienteData] = useState<any>(null);
    const [consultas, setConsultas] = useState<any[]>([]);
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const detailsRes = await getEntityDetails('paciente', id);
                    if (detailsRes) {
                        setPacienteData(detailsRes.data);
                    }

                    const [historyRes, medRes] = await Promise.all([
                        getPatientHistory(id),
                        getPatientMedicationHistory(id)
                    ]);

                    if (historyRes.success) setConsultas(historyRes.data || []);
                    if (medRes.success) setMedicamentos(medRes.data || []);
                } catch (error) {
                    console.error('Error fetching patient data:', error);
                    toast.error('Error al cargar los datos del paciente');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id]);

    const allInteractions = useMemo(() => {
        const items = [
            ...consultas.map(c => ({
                id: c.consulta.codigoConsulta,
                type: 'consulta',
                date: c.fechaAbordaje,
                title: 'CONSULTA',
                subtitle: `Dr. ${c.nombreMedico || 'N/A'}`,
                details: c.consulta.motivoConsulta,
                diagnostico: c.consulta.diagnosticoTexto,
                tratamiento: c.consulta.tratamiento,
            })),
            ...medicamentos.map(m => ({
                id: `MED-${m.entrega.id}`,
                type: 'med',
                date: m.entrega.fechaEntrega || m.fechaAbordaje,
                title: 'MEDICAMENTO',
                subtitle: m.nombreMedicamento,
                details: `${m.entrega.cantidadEntregada} ${m.presentacion || 'Unid'}`,
                diagnostico: null,
                tratamiento: m.entrega.indicaciones,
            }))
        ];
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [consultas, medicamentos]);

    const handleExportCSV = () => {
        if (!pacienteData) return;
        const data = allInteractions.map(item => ({
            Fecha: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            Tipo: item.title,
            Detalle: item.subtitle,
            Motivo: item.details,
            Clinica: item.diagnostico || 'N/A',
            Tratamiento: item.tratamiento || 'N/A'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        XLSX.writeFile(wb, `Historial_${pacienteData.cedulaPaciente}.xlsx`);
        toast.success('Excel descargado');
    };

    const handleExportPDF = () => {
        if (!pacienteData) return;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("HISTORIAL MÉDICO", 105, 15, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Paciente: ${pacienteData.nombrePaciente} ${pacienteData.apellidoPaciente}`, 14, 25);
        doc.text(`Cédula: ${pacienteData.cedulaPaciente}`, 14, 30);

        const tableData = allInteractions.map(item => [
            item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            item.title,
            item.subtitle,
            item.details,
            item.diagnostico || 'N/A',
            item.tratamiento || 'N/A'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Fecha', 'Tipo', 'Servicio', 'Motivo/Cant', 'Diagnóstico', 'Tratamiento']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
        });

        doc.save(`Historial_${pacienteData.cedulaPaciente}.pdf`);
        toast.success('PDF descargado');
    };

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div></MainLayout>;
    if (!pacienteData) return <MainLayout><EmptyState icon="error" title="No encontrado" description="Paciente no existe" /></MainLayout>;

    const edad = Math.floor((new Date().getTime() - new Date(pacienteData.fechaNacimiento).getTime()) / 31557600000);

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-4 p-4">
                {/* Header Simplificado */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
                        <h1 className="text-xl font-bold">Resumen de Historial</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-green-600 text-green-600 hover:bg-green-50"><Download className="w-4 h-4 mr-1" /> CSV</Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} className="border-red-600 text-red-600 hover:bg-red-50"><FileDown className="w-4 h-4 mr-1" /> PDF</Button>
                        <Button size="sm" onClick={() => router.push(`/datos-basicos/pacientes/${id}/editar`)} className="bg-blue-600"><Edit className="w-4 h-4 mr-1" /> Editar</Button>
                    </div>
                </div>

                {/* Banner de Datos Personales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre Completo</p>
                        <p className="font-bold text-gray-900">{pacienteData.nombrePaciente} {pacienteData.apellidoPaciente}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cédula e Identidad</p>
                        <p className="font-mono text-sm text-gray-700">{pacienteData.cedulaPaciente} ({edad} años)</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comunidad / Ubicación</p>
                        <p className="text-sm font-medium">{pacienteData.codigoComunidad}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono</p>
                        <p className="text-sm font-medium">{pacienteData.telefonoPaciente || 'N/A'}</p>
                    </div>
                </div>

                {/* Tabla Tipo Excel */}
                <Card className="border-gray-200 shadow-none">
                    <div className="overflow-hidden border-t">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 border-b">
                                <tr>
                                    <th className="px-4 py-2 border-r">Fecha</th>
                                    <th className="px-4 py-2 border-r">Tipo</th>
                                    <th className="px-4 py-2 border-r">Servicio / Méd</th>
                                    <th className="px-4 py-2 border-r">Motivo / Cant</th>
                                    <th className="px-4 py-2 border-r">Diagnóstico</th>
                                    <th className="px-4 py-2">Tratamiento / Indicaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allInteractions.length > 0 ? (
                                    allInteractions.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50">
                                            <td className="px-4 py-2 border-r font-medium whitespace-nowrap">{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A'}</td>
                                            <td className="px-4 py-2 border-r">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.type === 'consulta' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {item.title}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-r font-semibold text-gray-800">{item.subtitle}</td>
                                            <td className="px-4 py-2 border-r text-gray-600">{item.details}</td>
                                            <td className="px-4 py-2 border-r text-gray-700 italic">{item.diagnostico || '-'}</td>
                                            <td className="px-4 py-2 text-gray-600 bg-gray-50/30">{item.tratamiento || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Sin historial registrado</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
