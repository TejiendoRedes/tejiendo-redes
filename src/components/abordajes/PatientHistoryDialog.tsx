'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getPatientHistory } from '@/queries/consultas';;
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Calendar, User, Stethoscope, FileText, Activity } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PatientHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cedulaPaciente: string;
    nombrePaciente?: string;
    currentConsultaId?: string;
}

export function PatientHistoryDialog({
    open,
    onOpenChange,
    cedulaPaciente,
    nombrePaciente,
    currentConsultaId
}: PatientHistoryDialogProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && cedulaPaciente) {
            const fetchHistory = async () => {
                setLoading(true);
                const res = await getPatientHistory(cedulaPaciente);
                if (res.success && res.data) {
                    setHistory(res.data);
                }
                setLoading(false);
            };
            fetchHistory();
        }
    }, [open, cedulaPaciente]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Historial Médico
                    </DialogTitle>
                    <DialogDescription>
                        {nombrePaciente ? `Historial de consultas de ${nombrePaciente}` : `Paciente: ${cedulaPaciente}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Cargando historial...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p>No se encontraron consultas previas para este paciente.</p>
                        </div>
                    ) : (
                        <div className="h-full pr-4 overflow-y-auto">
                            <div className="space-y-6 pl-2 py-2">
                                {history.map((item, index) => {
                                    const isCurrent = item.consulta.codigoConsulta === currentConsultaId;
                                    return (
                                        <div key={item.consulta.codigoConsulta} className={`relative flex gap-4 ${isCurrent ? 'bg-blue-50/50 -mx-4 px-4 py-4 rounded-lg border border-blue-100' : ''}`}>
                                            {/* Timeline Line */}
                                            {index !== history.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200" />
                                            )}

                                            {/* Icon/Dot */}
                                            <div className="relative z-10 flex-shrink-0 mt-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                                                    <Stethoscope className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                            {item.fechaAbordaje ? format(new Date(item.fechaAbordaje), "d 'de' MMMM, yyyy", { locale: es }) : 'Fecha desconocida'}
                                                            {isCurrent && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Actual</Badge>}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                Dr. {item.nombreMedico || 'No asignado'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-gray-500">
                                                                    {item.especialidad || 'Medicina General'}
                                                                </Badge>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        {item.consulta.codigoConsulta}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-3">
                                                    {item.consulta.motivoConsulta && (
                                                        <div>
                                                            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1">Motivo</p>
                                                            <p className="text-gray-600">{item.consulta.motivoConsulta}</p>
                                                        </div>
                                                    )}

                                                    {item.consulta.diagnosticoTexto && (
                                                        <div>
                                                            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1">Diagnóstico</p>
                                                            <p className="text-gray-800">{item.consulta.diagnosticoTexto}</p>
                                                        </div>
                                                    )}

                                                    {(item.consulta.tratamiento || item.consulta.recomendaciones) && (
                                                        <>
                                                            <Separator className="my-2" />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {item.consulta.tratamiento && (
                                                                    <div>
                                                                        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1">Tratamiento</p>
                                                                        <p className="text-gray-600">{item.consulta.tratamiento}</p>
                                                                    </div>
                                                                )}
                                                                {item.consulta.recomendaciones && (
                                                                    <div>
                                                                        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1">Recomendaciones</p>
                                                                        <p className="text-gray-600">{item.consulta.recomendaciones}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}

                                                    {item.consulta.tensionArterial && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-red-500" />
                                                            <span className="text-xs text-gray-500">Tensión Arterial:</span>
                                                            <span className="font-medium">{item.consulta.tensionArterial}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
