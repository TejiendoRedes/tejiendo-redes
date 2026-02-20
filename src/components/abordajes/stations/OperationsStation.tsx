'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Pill, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ConsultaForm } from '../ConsultaForm';
import { EntregaMedicamentoForm } from '../EntregaMedicamentoForm';

import { AbordajeWithRelations } from '@/types/app-types';

interface OperationsStationProps {
    abordaje: AbordajeWithRelations;
}

export function OperationsStation({ abordaje }: OperationsStationProps) {
    const router = useRouter();
    const [consultaDialogOpen, setConsultaDialogOpen] = useState(false);
    const [entregaDialogOpen, setEntregaDialogOpen] = useState(false);

    const consultas = abordaje.consultas || [];
    const entregas = abordaje.medicamentos_entregados || [];

    const handleConsultaSuccess = () => {
        setConsultaDialogOpen(false);
        router.refresh(); // Trigger data revalidation
    };

    const handleEntregaSuccess = () => {
        setEntregaDialogOpen(false);
        router.refresh(); // Trigger data revalidation
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Operaciones</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Registra consultas y entregas de medicamentos durante el abordaje
                </p>
            </div>

            <Tabs defaultValue="consultas" className="space-y-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="consultas" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Consultas ({consultas.length})
                    </TabsTrigger>
                    <TabsTrigger value="entregas" className="flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Entregas ({entregas.length})
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: CONSULTAS */}
                <TabsContent value="consultas" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Total de consultas realizadas: <strong>{consultas.length}</strong>
                        </p>
                        <Dialog open={consultaDialogOpen} onOpenChange={setConsultaDialogOpen}>
                            <Button onClick={() => setConsultaDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar Nueva Consulta
                            </Button>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Registrar Nueva Consulta</DialogTitle>
                                </DialogHeader>
                                <ConsultaForm
                                    abordajeId={abordaje.codigoAbordaje}
                                    onSuccess={handleConsultaSuccess}
                                    onCancel={() => setConsultaDialogOpen(false)}
                                    isInline={true}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {consultas.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay consultas registradas para este abordaje</p>
                            <p className="text-sm mt-1">Haz clic en "Registrar Nueva Consulta" para comenzar</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {consultas.map((consulta: any) => (
                                <Card key={consulta.codigoConsulta} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {consulta.codigoConsulta}
                                                </Badge>
                                                <span className="text-sm text-gray-600">
                                                    {consulta.fechaConsulta && format(new Date(consulta.fechaConsulta), 'dd/MM/yyyy')}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                <strong>Paciente:</strong> {consulta.nombrePaciente || consulta.cedulaPaciente}
                                                <span className="text-xs text-gray-400 ml-2">({consulta.cedulaPaciente})</span>
                                            </p>
                                            {consulta.cedulaMedico && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Médico:</strong> {consulta.nombreMedico || consulta.cedulaMedico}
                                                </p>
                                            )}
                                        </div>

                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB 2: ENTREGAS DE MEDICAMENTOS */}
                <TabsContent value="entregas" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Total de entregas realizadas: <strong>{entregas.length}</strong>
                        </p>
                        <Dialog open={entregaDialogOpen} onOpenChange={setEntregaDialogOpen}>
                            <Button onClick={() => setEntregaDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar Nueva Entrega
                            </Button>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Registrar Entrega de Medicamento</DialogTitle>
                                </DialogHeader>
                                <EntregaMedicamentoForm
                                    abordajeId={abordaje.codigoAbordaje}
                                    onSuccess={handleEntregaSuccess}
                                    onCancel={() => setEntregaDialogOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {entregas.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay entregas de medicamentos registradas</p>
                            <p className="text-sm mt-1">Haz clic en "Registrar Nueva Entrega" para comenzar</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {entregas.map((entrega: any, idx: number) => (
                                <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">Medicamento</p>
                                            <p className="font-semibold">{entrega.nombreMedicamento}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Paciente</p>
                                            <p className="font-semibold text-xs">{entrega.nombrePaciente || entrega.cedulaPaciente}</p>
                                            <p className="text-[10px] text-gray-400">{entrega.cedulaPaciente}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Cantidad</p>
                                            <p className="font-semibold">{entrega.cantidadEntregada}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Código</p>
                                            <p className="font-semibold text-blue-600">{entrega.codigoMedicamento}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

            </Tabs>

        </div>
    );
}
