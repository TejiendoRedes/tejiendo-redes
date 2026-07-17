'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createConsulta } from '@/actions/consultas-actions';
import { LoadingSpinner } from '@/components/shared/UIComponents';
import { toast } from 'sonner';
import { BloodPressureInput } from '@/components/ui/blood-pressure-input';
import { AsyncSearchableSelect } from '@/components/shared/AsyncSearchableSelect';
import { getPacientes } from '@/queries/pacientes';;
import { getMedicos } from '@/queries/medicos';;
import { getEnfermedades } from '@/queries/enfermedades';;

interface ConsultaFormProps {
    abordajeId: string;
    // Removed static arrays in favor of direct action usage or passed fetchers if needed
    // But since we are importing actions directly, we might not need them as props unless for dependency injection
    initialPatientId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    isInline?: boolean;
    pacientes?: any[];
    medicos?: any[];
    enfermedades?: any[];
}

export function ConsultaForm({
    abordajeId,
    initialPatientId,
    onSuccess,
    onCancel,
    isInline = false
}: ConsultaFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cedulaPaciente: initialPatientId || '',
        cedulaMedico: '',
        motivoConsulta: '',
        diagnosticoTexto: '',
        recomendaciones: '',
        tratamiento: '',
        tensionArterial: '',
        enfermedadPrincipal: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const codigoConsulta = `CON-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

            const result = await createConsulta({
                codigoConsulta,
                codigoAbordaje: abordajeId,
                cedulaPaciente: formData.cedulaPaciente,
                cedulaMedico: formData.cedulaMedico,
                motivoConsulta: formData.motivoConsulta,
                diagnosticoTexto: formData.diagnosticoTexto,
                recomendaciones: formData.recomendaciones,
                tratamiento: formData.tratamiento,
                tensionArterial: formData.tensionArterial,
            }, formData.enfermedadPrincipal ? [formData.enfermedadPrincipal] : []);

            if (result.success) {
                toast.success('Consulta registrada exitosamente');
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(`/abordajes/${abordajeId}`);
                    router.refresh();
                }
            } else {
                toast.error(result.error || 'Error al registrar consulta');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <AsyncSearchableSelect
                        label="Paciente"
                        fetcher={getPacientes}
                        value={formData.cedulaPaciente}
                        onValueChange={(val) => handleSelectChange('cedulaPaciente', val)}
                        placeholder="Seleccione paciente"
                        searchPlaceholder="Buscar por nombre o cédula..."
                        idField="cedulaPaciente"
                        labelField="nombrePaciente"
                        secondaryLabelField="apellidoPaciente"
                        disabled={!!initialPatientId}
                        initialLabel={initialPatientId} // We might need to fetch the initial label if valid
                    />
                </div>

                <div className="space-y-2">
                    <AsyncSearchableSelect
                        label="Médico Tratante"
                        fetcher={getMedicos}
                        value={formData.cedulaMedico}
                        onValueChange={(val) => handleSelectChange('cedulaMedico', val)}
                        placeholder="Seleccione médico"
                        searchPlaceholder="Buscar por nombre o cédula..."
                        idField="cedulaTejedor"
                        labelField="nombreTejedor"
                        secondaryLabelField="apellidoTejedor"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="motivoConsulta">Motivo de Consulta</Label>
                <Textarea
                    id="motivoConsulta"
                    name="motivoConsulta"
                    value={formData.motivoConsulta}
                    onChange={handleChange}
                    placeholder="Describa el motivo de la consulta..."
                    required
                />
            </div>

            <div className="space-y-2">
                <AsyncSearchableSelect
                    label="Diagnóstico (CIE/Enfermedad)"
                    fetcher={getEnfermedades}
                    value={formData.enfermedadPrincipal}
                    onValueChange={(val) => handleSelectChange('enfermedadPrincipal', val)}
                    placeholder="Seleccione enfermedad (opcional)"
                    searchPlaceholder="Buscar por nombre..."
                    idField="codigoEnfermedad"
                    labelField="nombreEnfermedad"
                    secondaryLabelField="codigoEnfermedad"
                />
            </div>

            <div className="space-y-4 pt-2">
                <BloodPressureInput
                    value={formData.tensionArterial}
                    onChange={(val) => handleSelectChange('tensionArterial', val)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="diagnosticoTexto">Descripción del Diagnóstico</Label>
                <Textarea
                    id="diagnosticoTexto"
                    name="diagnosticoTexto"
                    value={formData.diagnosticoTexto}
                    onChange={handleChange}
                    placeholder="Detalles del diagnóstico clínico..."
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tratamiento">Tratamiento Indicado</Label>
                <Textarea
                    id="tratamiento"
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleChange}
                    placeholder="Medicamentos y dosis..."
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="recomendaciones">Recomendaciones</Label>
                <Textarea
                    id="recomendaciones"
                    name="recomendaciones"
                    value={formData.recomendaciones}
                    onChange={handleChange}
                    placeholder="Recomendaciones generales..."
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onCancel ? onCancel() : router.push('/atencion-medica')}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'Registrar Consulta'}
                </Button>
            </div>
        </form>
    );

    if (isInline) {
        return content;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Nueva Consulta Médica</CardTitle>
                <CardDescription>Registre los detalles de la atención al paciente</CardDescription>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );
}
