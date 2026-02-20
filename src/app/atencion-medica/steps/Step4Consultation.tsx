'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Info, HelpCircle, Stethoscope, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Badge } from '@/components/ui/badge';

interface Step4ConsultationProps {
    patient: any;
    medicos: any[];
    abordajes: any[];
    enfermedades: any[];
    initialData?: any;
    onBack: () => void;
    onFinish: (data: any) => Promise<void>;
}

export function Step4Consultation({
    patient,
    medicos,
    abordajes,
    enfermedades,
    initialData,
    onBack,
    onFinish
}: Step4ConsultationProps) {
    const [isSaving, setIsSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        cedulaMedico: initialData?.cedulaMedico || '',
        codigoAbordaje: initialData?.codigoAbordaje || '',
        motivoConsulta: initialData?.motivoConsulta || '',
        diagnosticoTexto: initialData?.diagnosticoTexto || '',
        tratamiento: initialData?.tratamiento || '',
        recomendaciones: initialData?.recomendaciones || '',
        tensionArterial: initialData?.tensionArterial || '',
    });
    const [selectedEnfermedades, setSelectedEnfermedades] = React.useState<string[]>(initialData?.selectedEnfermedades || []);

    // Prepare doctors for SearchableSelect
    const formattedMedicos = React.useMemo(() => {
        return medicos.map(m => ({
            cedulaTejedor: m.cedulaTejedor,
            nombreCompleto: `${m.nombreTejedor || m.tejedor?.nombreTejedor || ''} ${m.apellidoTejedor || m.tejedor?.apellidoTejedor || ''}`.trim(),
            especialidad: m.especialidad?.nombreEspecialidad || 'General'
        }));
    }, [medicos]);

    const toggleEnfermedad = (id: string) => {
        setSelectedEnfermedades(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const dataToSubmit = {
            ...formData,
            codigoAbordaje: formData.codigoAbordaje === "independent" || !formData.codigoAbordaje ? null : formData.codigoAbordaje,
            selectedEnfermedades
        };

        await onFinish(dataToSubmit);
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Consulta Médica</h2>
                    <p className="text-sm text-gray-500">Registro de la atención realizada.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column: Context and Motivo */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Contexto de Consulta
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <SearchableSelect
                                            items={formattedMedicos}
                                            value={formData.cedulaMedico}
                                            onValueChange={(val) => setFormData({ ...formData, cedulaMedico: val })}
                                            placeholder="Buscar Médico Atendiente..."
                                            searchPlaceholder="Buscar por nombre o cédula..."
                                            label="Médico Atendiente *"
                                            idField="cedulaTejedor"
                                            labelField="nombreCompleto"
                                            secondaryLabelField="especialidad"
                                            className="searchable-select-custom"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs font-semibold text-gray-700">Relación con Abordaje</Label>
                                            <div title="Seleccione si esta consulta se realiza dentro de un operativo (abordaje) o de forma independiente.">
                                                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                            </div>
                                        </div>
                                        <Select
                                            value={formData.codigoAbordaje}
                                            onValueChange={(val) => setFormData({ ...formData, codigoAbordaje: val })}
                                        >
                                            <SelectTrigger className="bg-gray-50/50 border-gray-100 focus:bg-white transition-colors h-11">
                                                <SelectValue placeholder="Sin abordaje (Consulta independiente)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="independent" className="font-semibold text-blue-600 italic">
                                                    Sin abordaje / Consulta independiente
                                                </SelectItem>
                                                {abordajes.map((ab: any) => {
                                                    const abd = ab.abordaje || ab;
                                                    return (
                                                        <SelectItem key={abd.codigoAbordaje} value={abd.codigoAbordaje}>
                                                            {abd.codigoAbordaje} - {abd.descripcion || 'Sin descripción'} ({abd.fechaAbordaje ? new Date(abd.fechaAbordaje).toLocaleDateString() : 'Sin fecha'})
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-gray-400 italic px-1 font-medium">Si la atención es fuera de un operativo, deje esta opción como "Sin abordaje".</p>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="motivo" className="text-xs font-semibold text-gray-700">Motivo de Consulta *</Label>
                                        <Textarea
                                            id="motivo"
                                            value={formData.motivoConsulta}
                                            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                                            required
                                            placeholder="Describa el motivo principal..."
                                            className="min-h-[120px] bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Diagnosis and Treatment */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Diagnóstico y Tratamiento
                                </h3>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="diagnostico" className="text-xs font-semibold text-gray-700">Diagnóstico (Texto) *</Label>
                                        <Textarea
                                            id="diagnostico"
                                            value={formData.diagnosticoTexto}
                                            onChange={(e) => setFormData({ ...formData, diagnosticoTexto: e.target.value })}
                                            required
                                            className="h-28 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                            placeholder="Describa el diagnóstico detallado..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="tratamiento" className="text-xs font-semibold text-gray-700">Tratamiento *</Label>
                                            <Textarea
                                                id="tratamiento"
                                                value={formData.tratamiento}
                                                onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                                                required
                                                className="h-44 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                                placeholder="Plan terapéutico..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="recomendaciones" className="text-xs font-semibold text-gray-700">Indicaciones y Recomendaciones *</Label>
                                            <Textarea
                                                id="recomendaciones"
                                                value={formData.recomendaciones}
                                                onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
                                                required
                                                className="h-44 bg-gray-50/50 border-gray-100 focus:bg-white transition-colors resize-none shadow-inner"
                                                placeholder="Recomendaciones para el paciente..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Width: Disease Selection (Scalable Version) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden border-t-4 border-orange-500">
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                            <Search className="w-4 h-4" />
                                            Enfermedades Diagnosticadas
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Agregue las enfermedades detectadas en esta consulta</p>
                                    </div>
                                    <div className="w-full md:w-[400px]">
                                        <SearchableSelect
                                            items={enfermedades.filter(e => !selectedEnfermedades.includes(e.codigoEnfermedad))}
                                            value=""
                                            onValueChange={(val) => val && toggleEnfermedad(val)}
                                            placeholder="Buscar y Agregar Enfermedad..."
                                            searchPlaceholder="Escriba nombre de enfermedad..."
                                            idField="codigoEnfermedad"
                                            labelField="nombreEnfermedad"
                                            className="disease-adder"
                                        />
                                    </div>
                                </div>

                                <div className="min-h-[100px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-wrap gap-2 p-6 bg-gray-50/30 content-start">
                                    {selectedEnfermedades.length === 0 ? (
                                        <div className="w-full flex flex-col items-center justify-center text-gray-400 py-4 opacity-70">
                                            <Plus className="w-8 h-8 mb-2 border-2 border-dashed border-gray-300 rounded-full p-2 stroke-[1.5]" />
                                            <p className="text-xs font-semibold italic">No hay enfermedades seleccionadas</p>
                                        </div>
                                    ) : (
                                        selectedEnfermedades.map((id) => {
                                            const enf = enfermedades.find(e => e.codigoEnfermedad === id);
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-2 bg-white border border-orange-100 px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all group animate-in fade-in zoom-in duration-200"
                                                >
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                    <span className="text-xs font-bold text-gray-700">{enf?.nombreEnfermedad}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleEnfermedad(id)}
                                                        className="ml-1 p-1 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={onBack} className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-11 px-6 font-medium">
                        Anterior
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[200px] h-11 shadow-lg shadow-blue-200 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl">
                        {isSaving ? 'Guardando...' : 'Finalizar y Guardar'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
