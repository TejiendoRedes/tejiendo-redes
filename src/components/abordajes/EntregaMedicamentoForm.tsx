'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AsyncSearchableSelect } from '@/components/shared/AsyncSearchableSelect';
import { toast } from 'sonner';
import { registerMedicamentoEntrega } from '@/actions/abordajes-actions';
import { getPacientes } from '@/queries/pacientes';;
import { getMedicamentos } from '@/queries/medicamentos';;
import { getMedicos } from '@/queries/medicos';;

interface EntregaMedicamentoFormProps {
    abordajeId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EntregaMedicamentoForm({
    abordajeId,
    onSuccess,
    onCancel
}: EntregaMedicamentoFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cedulaPaciente: '',
        codigoMedicamento: '',
        cantidadEntregada: '',
        cedulaMedico: '',
        indicaciones: '',
        fechaEntrega: new Date().toISOString().split('T')[0], // Today's date
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.cedulaPaciente) {
                toast.error('Debes seleccionar un paciente');
                setLoading(false);
                return;
            }
            if (!formData.codigoMedicamento) {
                toast.error('Debes seleccionar un medicamento');
                setLoading(false);
                return;
            }
            if (!formData.cantidadEntregada || parseInt(formData.cantidadEntregada) <= 0) {
                toast.error('La cantidad debe ser mayor a 0');
                setLoading(false);
                return;
            }

            const data = {
                cedulaPaciente: formData.cedulaPaciente,
                codigoMedicamento: formData.codigoMedicamento,
                codigoAbordaje: abordajeId, // Include abordaje ID
                cantidadEntregada: parseInt(formData.cantidadEntregada),
                cedulaTejedor: formData.cedulaMedico || '', // Will need a fallback or check if backend allows empty
                fechaEntrega: new Date(formData.fechaEntrega),
            };

            // If cedulaTejedor is required by DB but optional in form, we might need a default or error
            // Assuming the backend or form requires it if the schema demands it.
            // But wait, the schema SAYS it is NOT NULL. So we MUST provide it.
            // I should make it required in form or provide a default logged-in user ID if available. 
            // For now, I'll make it required in the UI validation if it's empty.
            if (!data.cedulaTejedor) {
                toast.error('Debes seleccionar un médico/tejedor responsable');
                setLoading(false);
                return;
            }

            const res = await registerMedicamentoEntrega(data);

            if (res.success) {
                toast.success('Entrega de medicamento registrada exitosamente');
                if (onSuccess) onSuccess();
                // Reset form
                setFormData({
                    cedulaPaciente: '',
                    codigoMedicamento: '',
                    cantidadEntregada: '',
                    cedulaMedico: '',
                    indicaciones: '',
                    fechaEntrega: new Date().toISOString().split('T')[0],
                });
            } else {
                toast.error(res.error || 'Error al registrar la entrega');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Paciente */}
            <div>
                <Label htmlFor="paciente">Paciente <span className="text-red-500 font-bold">*</span></Label>
                <AsyncSearchableSelect
                    fetcher={getPacientes}
                    value={formData.cedulaPaciente}
                    onValueChange={(value) => setFormData({ ...formData, cedulaPaciente: value })}
                    placeholder="Seleccionar paciente..."
                    searchPlaceholder="Buscar paciente..."
                    idField="cedulaPaciente"
                    labelField="nombrePaciente"
                    secondaryLabelField="apellidoPaciente"
                />
            </div>

            {/* Medicamento */}
            <div>
                <Label htmlFor="medicamento">Medicamento <span className="text-red-500 font-bold">*</span></Label>
                <AsyncSearchableSelect
                    fetcher={getMedicamentos}
                    value={formData.codigoMedicamento}
                    onValueChange={(value) => setFormData({ ...formData, codigoMedicamento: value })}
                    placeholder="Seleccionar medicamento..."
                    searchPlaceholder="Buscar medicamento..."
                    idField="codigoMedicamento"
                    labelField="nombreMedicamento"
                    secondaryLabelField="presentacion"
                />
            </div>

            {/* Cantidad */}
            <div>
                <Label htmlFor="cantidad">Cantidad Entregada <span className="text-red-500 font-bold">*</span></Label>
                <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={formData.cantidadEntregada}
                    onChange={(e) => setFormData({ ...formData, cantidadEntregada: e.target.value })}
                    placeholder="Ej: 10"
                    required
                />
            </div>

            {/* Médico */}
            <div>
                <Label htmlFor="medico">Médico/Tejedor Responsable <span className="text-red-500 font-bold">*</span></Label>
                <AsyncSearchableSelect
                    fetcher={getMedicos}
                    value={formData.cedulaMedico}
                    onValueChange={(value) => setFormData({ ...formData, cedulaMedico: value })}
                    placeholder="Seleccionar médico..."
                    searchPlaceholder="Buscar médico..."
                    idField="cedulaTejedor"
                    labelField="nombreTejedor"
                    secondaryLabelField="apellidoTejedor"
                />
            </div>

            {/* Indicaciones */}
            <div>
                <Label htmlFor="indicaciones">Indicaciones (Opcional - No se guarda en BD actualmente)</Label>
                <Textarea
                    id="indicaciones"
                    value={formData.indicaciones}
                    onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                    placeholder="Tomar 1 cada 8 horas..."
                    rows={3}
                />
            </div>

            {/* Fecha */}
            <div>
                <Label htmlFor="fecha">Fecha de Entrega</Label>
                <Input
                    id="fecha"
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    required
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Entrega'}
                </Button>
            </div>
        </form>
    );
}
