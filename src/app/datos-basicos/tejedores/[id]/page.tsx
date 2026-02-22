'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowLeft,
    Loader2,
    Edit,
    Download,
    FileDown,
    User,
    Briefcase,
    Phone,
    MapPin
} from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import { getTejedor, getTejedorHistory } from '@/queries/tejedores-actions';;
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function TejedorHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [tejedorData, setTejedorData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [tejRes, historyRes] = await Promise.all([
                        getTejedor(id),
                        getTejedorHistory(id)
                    ]);

                    if (tejRes.success) {
                        setTejedorData(tejRes.data);
                    }
                    if (historyRes.success) {
                        setHistory(historyRes.data || []);
                    }
                } catch (error) {
                    console.error('Error fetching tejedor data:', error);
                    toast.error('Error al cargar los datos del tejedor');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id]);

    const handleExportCSV = () => {
        if (!tejedorData) return;
        const data = history.map(item => ({
            Fecha: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            Tipo: item.title,
            Sujeto_Servicio: item.subtitle,
            Detalle: item.details || 'N/A',
            Informacion_Extra: item.extra || 'N/A'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial_Tejedor");
        XLSX.writeFile(wb, `Historial_Tejedor_${tejedorData.cedulaTejedor}.xlsx`);
        toast.success('Excel descargado');
    };

    const handleExportPDF = () => {
        if (!tejedorData) return;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("HISTORIAL DE ACTIVIDAD - TEJEDOR", 105, 15, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Tejedor: ${tejedorData.nombreTejedor} ${tejedorData.apellidoTejedor}`, 14, 25);
        doc.text(`Cédula: ${tejedorData.cedulaTejedor}`, 14, 30);
        doc.text(`Profesión: ${tejedorData.profesionTejedor}`, 14, 35);

        const tableData = history.map(item => [
            item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A',
            item.title,
            item.subtitle,
            item.details || 'N/A',
            item.extra || 'N/A'
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Fecha', 'Tipo de Actividad', 'Relacionado con', 'Detalles', 'Info Extra']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
        });

        doc.save(`Historial_Tejedor_${tejedorData.cedulaTejedor}.pdf`);
        toast.success('PDF descargado');
    };

    if (loading) return <MainLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div></MainLayout>;
    if (!tejedorData) return <MainLayout><EmptyState icon="error" title="No encontrado" description="Tejedor no existe" /></MainLayout>;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-4 p-4">
                {/* Header Simplificado */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/datos-basicos/tejedores')}><ArrowLeft className="w-5 h-5" /></Button>
                        <h1 className="text-xl font-bold">Historial del Tejedor</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-green-600 text-green-600 hover:bg-green-50"><Download className="w-4 h-4 mr-1" /> CSV</Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} className="border-red-600 text-red-600 hover:bg-red-50"><FileDown className="w-4 h-4 mr-1" /> PDF</Button>
                    </div>
                </div>

                {/* Banner de Datos Personales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre Completo</p>
                        <p className="font-bold text-gray-900">{tejedorData.nombreTejedor} {tejedorData.apellidoTejedor}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cédula</p>
                        <p className="font-mono text-sm text-gray-700">{tejedorData.cedulaTejedor}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profesión / Tipo</p>
                        <p className="text-sm font-medium">{tejedorData.profesionTejedor} ({tejedorData.tipodeVoluntario})</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono</p>
                        <p className="text-sm font-medium">{tejedorData.telefonoTejedor || 'N/A'}</p>
                    </div>
                </div>

                {/* Tabla Tipo Excel */}
                <Card className="border-gray-200 shadow-none">
                    <div className="overflow-hidden border-t">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 border-b">
                                <tr>
                                    <th className="px-4 py-2 border-r w-32">Fecha</th>
                                    <th className="px-4 py-2 border-r w-48">Tipo de Actividad</th>
                                    <th className="px-4 py-2 border-r">Relacionado con / Servicio</th>
                                    <th className="px-4 py-2 border-r">Detalles / Motivo</th>
                                    <th className="px-4 py-2">Información Extra</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {history.length > 0 ? (
                                    history.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50">
                                            <td className="px-4 py-2 border-r font-medium whitespace-nowrap">
                                                {item.date ? format(new Date(item.date), 'dd/MM/yyyy') : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 border-r">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold 
                                                    ${item.type === 'abordaje' ? 'bg-purple-100 text-purple-700' :
                                                        item.type === 'consulta' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-green-100 text-green-700'}`}>
                                                    {item.title}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border-r font-semibold text-gray-800">{item.subtitle}</td>
                                            <td className="px-4 py-2 border-r text-gray-600">{item.details || '-'}</td>
                                            <td className="px-4 py-2 text-gray-700 italic bg-gray-50/30">{item.extra || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Sin historial registrado</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
