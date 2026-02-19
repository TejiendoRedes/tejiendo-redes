'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Plus, History as HistoryIcon } from 'lucide-react';
import { getAntecedentes, createAntecedente, updateAntecedente, getNextAntecedenteCodigo } from '@/actions/antecedentes-actions';
import { toast } from 'sonner';
import { BloodPressureInput } from '@/components/ui/blood-pressure-input';

interface Step3MedicalHistoryProps {
    patient: any;
    onBack: () => void;
    onNext: (history: any) => void;
}

export function Step3MedicalHistory({ patient, onBack, onNext }: Step3MedicalHistoryProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [history, setHistory] = React.useState<any>(null);
    const [formData, setFormData] = React.useState({
        peso: '',
        talla: '',
        temperatura: '',
        FC: '',
        TA: '',
        enfermedadesPrevias: '',
        alergias: '',
        enfermedadesFamilia: '',
        cirugiasPrevias: '',
        medicamentosActuales: '',
    });

    React.useEffect(() => {
        loadHistory();
    }, [patient.cedulaPaciente]);

    const loadHistory = async () => {
        setIsLoading(true);
        const res = await getAntecedentes();
        if (res.success && res.data) {
            const patientHistory = res.data.find((h: any) => h.cedulaPaciente === patient.cedulaPaciente);
            if (patientHistory) {
                setHistory(patientHistory);
                setFormData({
                    peso: patientHistory.peso.toString(),
                    talla: patientHistory.talla.toString(),
                    temperatura: patientHistory.temperatura.toString(),
                    FC: patientHistory.FC,
                    TA: patientHistory.TA,
                    enfermedadesPrevias: patientHistory.enfermedadesPrevias,
                    alergias: patientHistory.alergias,
                    enfermedadesFamilia: patientHistory.enfermedadesFamilia,
                    cirugiasPrevias: patientHistory.cirugiasPrevias || '',
                    medicamentosActuales: patientHistory.medicamentosActuales || '',
                });
            }
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (history) {
                // Update existing
                const res = await updateAntecedente(history.codigoAntecedente, {
                    ...formData,
                    peso: formData.peso.toString(),
                    talla: formData.talla.toString(),
                    temperatura: formData.temperatura.toString(),
                });
                if (res.success) {
                    toast.success('Antecedentes actualizados');
                    onNext(formData);
                } else {
                    toast.error(res.error || 'Error al actualizar antecedentes');
                }
            } else {
                // Create new
                const codeRes = await getNextAntecedenteCodigo();
                if (!codeRes.success) throw new Error('Error al generar código');

                const res = await createAntecedente({
                    codigoAntecedente: codeRes.data!,
                    cedulaPaciente: patient.cedulaPaciente,
                    ...formData,
                });
                if (res.success) {
                    toast.success('Antecedentes registrados');
                    onNext(formData);
                } else {
                    toast.error(res.error || 'Error al registrar antecedentes');
                }
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando datos médicos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Datos Médicos</h2>
                    <p className="text-sm text-gray-500">Historial médico, antecedentes y constantes vitales actuales.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Vital Signs Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Signos Vitales
                            </h3>
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">Campos Requeridos *</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="peso" className="text-xs font-semibold text-gray-700">Peso (kg) *</Label>
                                <Input
                                    id="peso" type="number" step="0.01" value={formData.peso}
                                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                                    required
                                    className="bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="talla" className="text-xs font-semibold text-gray-700">Talla (m) *</Label>
                                <Input
                                    id="talla" type="number" step="0.01" value={formData.talla}
                                    onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                                    required
                                    className="bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temperatura" className="text-xs font-semibold text-gray-700">Temp (°C) *</Label>
                                <Input
                                    id="temperatura" type="number" step="0.1" value={formData.temperatura}
                                    onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                                    required
                                    className="bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fc" className="text-xs font-semibold text-gray-700">FC (lpm) *</Label>
                                <Input
                                    id="fc" value={formData.FC}
                                    onChange={(e) => setFormData({ ...formData, FC: e.target.value })}
                                    required
                                    placeholder="80"
                                    className="bg-gray-50/50 border-gray-100 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <BloodPressureInput
                                    label="Tensión Arterial *"
                                    value={formData.TA}
                                    onChange={(val) => setFormData({ ...formData, TA: val })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical History Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <HistoryIcon className="w-4 h-4" />
                            Historial Médico
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="enfPrev" className="text-xs font-semibold text-gray-700">Enfermedades Previas *</Label>
                                <Textarea
                                    id="enfPrev" value={formData.enfermedadesPrevias}
                                    onChange={(e) => setFormData({ ...formData, enfermedadesPrevias: e.target.value })}
                                    required
                                    className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alergias" className="text-xs font-semibold text-gray-700">Alergias *</Label>
                                <Textarea
                                    id="alergias" value={formData.alergias}
                                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                                    required
                                    className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enfFam" className="text-xs font-semibold text-gray-700">Enfermedades de Familia *</Label>
                                <Textarea
                                    id="enfFam" value={formData.enfermedadesFamilia}
                                    onChange={(e) => setFormData({ ...formData, enfermedadesFamilia: e.target.value })}
                                    required
                                    className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cirugias" className="text-xs font-semibold text-gray-700">Cirugías Previas</Label>
                                <Textarea
                                    id="cirugias" value={formData.cirugiasPrevias}
                                    onChange={(e) => setFormData({ ...formData, cirugiasPrevias: e.target.value })}
                                    className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="meds" className="text-xs font-semibold text-gray-700">Medicamentos Actuales</Label>
                                <Textarea
                                    id="meds" value={formData.medicamentosActuales}
                                    onChange={(e) => setFormData({ ...formData, medicamentosActuales: e.target.value })}
                                    className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onBack}>
                        Anterior
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? 'Guardando...' : 'Siguiente: Consulta'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
