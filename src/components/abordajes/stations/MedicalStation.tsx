'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Clock, CheckCircle2, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { getAbordajeAsistencia, updateAbordajeAsistencia } from '@/actions/abordajes-actions';
import { getEnfermedades } from '@/actions/enfermedades-actions';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ConsultaForm } from '../ConsultaForm'; // Adjust path if needed
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AbordajeAsistencia {
    id: number;
    cedulaPaciente: string;
    horaLlegada: Date;
    estado: string;
    serviciosRequeridos: string | null;
    paciente: {
        nombre: string;
        apellido: string;
        fechaNacimiento: string | null;
    };
}

export function MedicalStation({ abordaje }: { abordaje: any }) {
    const abordajeId = abordaje.codigoAbordaje;

    // State
    const [queue, setQueue] = useState<AbordajeAsistencia[]>([]);
    const [enfermedades, setEnfermedades] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<AbordajeAsistencia | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const enfRes = await getEnfermedades();
                if (enfRes.success && enfRes.data) {
                    setEnfermedades(enfRes.data);
                }
            } catch (error) {
                console.error('Error loading config:', error);
            }
        };
        fetchInitial();
    }, []);

    // Queue Polling / Fetching
    useEffect(() => {
        let mounted = true;
        const fetchQueue = async () => {
            setIsLoading(true);
            try {
                const response = await getAbordajeAsistencia(abordajeId);
                if (mounted && response.success && response.data) {
                    // Filter for patients ready for medical attention
                    // Logic: 'En Triaje' is ready for doctor? Or 'En Espera'?
                    // Let's assume 'En Espera' goes to reception, then maybe Triaje/Medical.
                    // For now, show ANYONE not 'Finalizado' and not 'En Farmacia'?
                    // Or specifically 'En Espera' and 'En Triaje' and 'En Consulta'.
                    const active = response.data.filter((item: AbordajeAsistencia) =>
                        ['En Espera', 'En Triaje', 'En Consulta'].includes(item.estado)
                    );
                    setQueue(active);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchQueue();
        return () => { mounted = false; };
    }, [abordajeId, refreshTrigger]);

    const handleStartConsultation = async (patient: AbordajeAsistencia) => {
        // Update status to 'En Consulta' if not already
        if (patient.estado !== 'En Consulta') {
            try {
                await updateAbordajeAsistencia(patient.id, { estado: 'En Consulta' });
            } catch (e) {
                console.error('Failed to update status', e);
            }
        }

        setSelectedPatient(patient);
        setIsSheetOpen(true);
    };

    const handleConsultationSuccess = async () => {
        toast.success(`Consulta registrada para ${selectedPatient?.paciente.nombre}`);

        // Update status to 'En Farmacia' (or Finalizado if no meds?)
        // For now move to Farmacia
        if (selectedPatient) {
            await updateAbordajeAsistencia(selectedPatient.id, { estado: 'En Farmacia' });
        }

        setIsSheetOpen(false);
        setSelectedPatient(null);
        setRefreshTrigger(prev => prev + 1);
    };

    // Filter Medicos from Abordaje Tejedores
    // Assuming role or profession check. For now passing all, or filter by 'Médico' if possible.
    // abordaje.tejedores is array of joined objects.
    const medicos = abordaje.tejedores || [];

    // Helper to format patient for SearchableSelect (though we only need it for list here)
    const patientListForForm = selectedPatient ? [{
        cedulaPaciente: selectedPatient.cedulaPaciente,
        nombrePaciente: selectedPatient.paciente.nombre,
        apellidoPaciente: selectedPatient.paciente.apellido
    }] : [];

    return (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in-50 duration-500">
            <Card className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Stethoscope className="w-5 h-5" />
                            Estación Médica
                        </CardTitle>
                        <CardDescription>
                            Seleccione un paciente de la lista para iniciar su consulta.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                        {queue.length} Pacientes en Espera
                    </Badge>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Cargando pacientes...
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay pacientes esperando atención médica en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {queue.map((item) => (
                                <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md border ${item.estado === 'En Consulta' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                                    <div className={`h-1.5 w-full ${item.estado === 'En Consulta' ? 'bg-blue-500' : 'bg-yellow-400'}`} />
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{item.paciente.nombre} {item.paciente.apellido}</h4>
                                                <p className="text-sm text-gray-500">{item.cedulaPaciente}</p>
                                            </div>
                                            <Badge variant={item.estado === 'En Consulta' ? 'default' : 'secondary'} className={item.estado === 'En Consulta' ? 'bg-blue-600' : 'bg-yellow-100 text-yellow-800'}>
                                                {item.estado}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-400 gap-2">
                                            <Clock className="w-3 h-3" />
                                            Llegada: {format(new Date(item.horaLlegada), 'h:mm a')}
                                        </div>

                                        <Button
                                            className="w-full mt-2"
                                            variant={item.estado === 'En Consulta' ? 'secondary' : 'default'}
                                            onClick={() => handleStartConsultation(item)}
                                        >
                                            {item.estado === 'En Consulta' ? 'Retomar Consulta' : 'Atender Paciente'}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-xl overflow-y-auto w-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                            Consulta Médica
                        </SheetTitle>
                        <SheetDescription>
                            Atendiendo a: <span className="font-medium text-gray-900">{selectedPatient?.paciente.nombre} {selectedPatient?.paciente.apellido}</span>
                        </SheetDescription>
                    </SheetHeader>

                    {selectedPatient && (
                        <div className="pb-10">
                            <ConsultaForm
                                abordajeId={abordajeId}
                                pacientes={patientListForForm}
                                medicos={medicos} // TODO: Filter by profession if needed
                                enfermedades={enfermedades}
                                initialPatientId={selectedPatient.cedulaPaciente}
                                onSuccess={handleConsultationSuccess}
                                onCancel={() => setIsSheetOpen(false)}
                                isInline={true}
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
