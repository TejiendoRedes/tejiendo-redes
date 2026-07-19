'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, CheckCircle2, AlertCircle, Plus, Trash2, Loader2, Package } from 'lucide-react';
import { updateAbordajeAsistencia, registerMedicamentoEntrega } from '@/actions/abordajes-actions';
import { getAbordajeAsistencia } from '@/queries/abordajes';;
import { getMedicamentos } from '@/queries/medicamentos';;
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AbordajeAsistencia {
    id: number;
    cedulaPaciente: string;
    horaLlegada: Date;
    estado: string;
    paciente: {
        nombre: string;
        apellido: string;
    };
}

interface MedicationItem {
    codigoMedicamento: string;
    cantidad: number;
}

import { AbordajeWithRelations } from '@/types/app-types';

interface PharmacyStationProps {
    abordaje: AbordajeWithRelations;
}

export function PharmacyStation({ abordaje }: PharmacyStationProps) {
    const abordajeId = abordaje.codigoAbordaje;

    // State
    const [queue, setQueue] = useState<AbordajeAsistencia[]>([]);
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<AbordajeAsistencia | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form State
    const [deliveryItems, setDeliveryItems] = useState<MedicationItem[]>([{ codigoMedicamento: '', cantidad: 1 }]);
    const [selectedResponsible, setSelectedResponsible] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchMeds = async () => {
            try {
                const res = await getMedicamentos();
                if (res.success && res.data) {
                    setMedicamentos(res.data);
                }
            } catch (error) {
                console.error('Error loading meds:', error);
            }
        };
        fetchMeds();
    }, []);

    // Queue Polling
    useEffect(() => {
        let mounted = true;
        const fetchQueue = async () => {
            setIsLoading(true);
            try {
                const response = await getAbordajeAsistencia(abordajeId);
                if (mounted && response.success && response.data) {
                    // Filter for patients ready for pharmacy
                    const active = response.data.filter((item: AbordajeAsistencia) =>
                        ['En Farmacia'].includes(item.estado)
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

    const handleOpenDelivery = (patient: AbordajeAsistencia) => {
        setSelectedPatient(patient);
        setDeliveryItems([{ codigoMedicamento: '', cantidad: 1 }]);
        setIsSheetOpen(true);
    };

    const handleAddItem = () => {
        setDeliveryItems([...deliveryItems, { codigoMedicamento: '', cantidad: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...deliveryItems];
        newItems.splice(index, 1);
        setDeliveryItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof MedicationItem, value: any) => {
        const newItems = [...deliveryItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setDeliveryItems(newItems);
    };

    const handleSubmitDelivery = async () => {
        if (!selectedPatient) return;

        // Validation
        if (deliveryItems.some(item => !item.codigoMedicamento || item.cantidad <= 0)) {
            toast.error('Complete todos los campos de medicamentos con cantidades válidas.');
            return;
        }

        if (!selectedResponsible) {
            toast.error('Seleccione un responsable de la entrega.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Process each item
            const promises = deliveryItems.map(item =>
                registerMedicamentoEntrega({
                    codigoAbordaje: abordajeId,
                    codigoMedicamento: item.codigoMedicamento,
                    codigoPaciente: selectedPatient.cedulaPaciente,
                    cantidad: item.cantidad,
                    cedulaTejedor: selectedResponsible
                })
            );

            await Promise.all(promises);

            // Update Status to Finalizado
            await updateAbordajeAsistencia(selectedPatient.id, { estado: 'Finalizado' });

            toast.success('Medicamentos entregados y paciente finalizado.');
            setIsSheetOpen(false);
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error(error);
            toast.error('Error al registrar entrega.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinishWithoutMeds = async () => {
        if (!selectedPatient) return;
        if (!confirm('¿Seguro que desea finalizar sin entregar medicamentos?')) return;

        setIsSubmitting(true);
        try {
            await updateAbordajeAsistencia(selectedPatient.id, { estado: 'Finalizado' });
            toast.success('Atención finalizada.');
            setIsSheetOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            toast.error('Error al finalizar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in-50 duration-500">
            <Card className="border-green-100 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <Pill className="w-5 h-5" />
                            Estación de Farmacia
                        </CardTitle>
                        <CardDescription>
                            Entrega de medicamentos a pacientes atendidos.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {queue.length} Por Despachar
                    </Badge>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Cargando lista...
                        </div>
                    ) : queue.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay pacientes en cola de farmacia.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {queue.map((item) => (
                                <Card key={item.id} className="border border-green-100 hover:border-green-300 transition-colors shadow-sm">
                                    <div className="h-1.5 w-full bg-green-500" />
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{item.paciente.nombre} {item.paciente.apellido}</h4>
                                                <p className="text-sm text-gray-500">{item.cedulaPaciente}</p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {item.estado}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-400 gap-2">
                                            <Clock className="w-3 h-3" />
                                            Llegada: {format(new Date(item.horaLlegada), 'h:mm a')}
                                        </div>

                                        <Button
                                            className="w-full mt-2 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleOpenDelivery(item)}
                                        >
                                            <Pill className="w-4 h-4 mr-2" />
                                            Despachar
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col h-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-green-700">
                            <Pill className="w-5 h-5" />
                            Entrega de Medicamentos
                        </SheetTitle>
                        <SheetDescription>
                            Paciente: <span className="font-medium text-gray-900">{selectedPatient?.paciente.nombre} {selectedPatient?.paciente.apellido}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4">
                            <p className="font-semibold flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Atención</p>
                            Verifique la receta médica antes de entregar. Esta acción descontará del inventario.
                        </div>

                        <div className="space-y-4">
                            {deliveryItems.map((item, index) => (
                                <div key={index} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-xs">Medicamento</Label>
                                        <SearchableSelect
                                            items={medicamentos}
                                            value={item.codigoMedicamento}
                                            onValueChange={(val) => handleItemChange(index, 'codigoMedicamento', val)}
                                            placeholder="Buscar medicamento..."
                                            searchPlaceholder="Nombre o código..."
                                            idField="codigoMedicamento"
                                            labelField="nombreMedicamento"
                                            secondaryLabelField="codigoMedicamento"
                                        />
                                    </div>
                                    <div className="w-20 space-y-2">
                                        <Label className="text-xs">Cant.</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    {deliveryItems.length > 1 && (
                                        <Button variant="ghost" size="icon" className="mb-0.5 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button variant="outline" onClick={handleAddItem} className="w-full border-dashed border-gray-300 text-gray-500 hover:text-green-600 hover:border-green-300">
                                <Plus className="w-4 h-4 mr-2" /> Agregar Item
                            </Button>

                            <div className="space-y-2 pt-4 border-t">
                                <Label className="text-xs font-semibold">Responsable de Entrega</Label>
                                <SearchableSelect
                                    items={abordaje.tejedores || []}
                                    value={selectedResponsible}
                                    onValueChange={setSelectedResponsible}
                                    placeholder="Seleccionar responsable..."
                                    searchPlaceholder="Buscar por nombre..."
                                    idField="cedulaTejedor"
                                    labelField="nombreTejedor"
                                    secondaryLabelField="apellidoTejedor"
                                />
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-6 border-t mt-auto">
                        <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between">
                            <Button variant="ghost" className="text-gray-500" onClick={handleFinishWithoutMeds} disabled={isSubmitting}>
                                Finalizar sin entrega
                            </Button>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmitDelivery} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Entrega'}
                                </Button>
                            </div>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
