'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Loader2, Save } from 'lucide-react';
import { Abordaje } from '@/db/schema/abordajes';

export interface AbordajeFormProps {
    initialData?: Abordaje;
    comunidades: any[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function AbordajeForm({
    initialData,
    comunidades,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: AbordajeFormProps) {
    const defaultDate = new Date().toISOString().split('T')[0];

    // Parse initial date if exists
    const initialDateStr = initialData?.fechaAbordaje
        ? new Date(initialData.fechaAbordaje).toISOString().split('T')[0]
        : defaultDate;

    const [formData, setFormData] = useState({
        codigoAbordaje: initialData?.codigoAbordaje || '',
        descripcion: initialData?.descripcion || '',
        fechaAbordaje: initialDateStr,
        horaInicio: initialData?.horaInicio || '08:00',
        horaFin: initialData?.horaFin || '12:00',
        estado: initialData?.estado || 'Planificado',
        codigoComunidad: initialData?.codigoComunidad || '',
        tipoAbordaje: initialData?.tipoAbordaje || '',
        participantesEstimados: initialData?.participantesEstimados || 0,
        recursosAdicionales: initialData?.recursosAdicionales || '',
        transporte: initialData?.transporte || false,
        refrigerios: initialData?.refrigerios || false,
        espacioCubierto: initialData?.espacioCubierto || false,
        notasLogistica: initialData?.notasLogistica || '',
        notas: initialData?.notas || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean, name: string) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {initialData && (
                <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                        id="codigo"
                        value={formData.codigoAbordaje}
                        disabled={true}
                        className="bg-gray-100"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción / Título *</Label>
                <Input
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ej: Jornada Integral El Valle"
                    required
                    value={formData.descripcion}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <SearchableSelect
                    label="Comunidad *"
                    items={comunidades}
                    value={formData.codigoComunidad}
                    onValueChange={(val) => handleSelectChange(val, 'codigoComunidad')}
                    placeholder="Seleccionar comunidad"
                    searchPlaceholder="Buscar por nombre o municipio..."
                    idField="codigoComunidad"
                    labelField="nombreComunidad"
                    secondaryLabelField="municipio"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fechaAbordaje">Fecha *</Label>
                    <Input
                        id="fechaAbordaje"
                        name="fechaAbordaje"
                        type="date"
                        required
                        value={formData.fechaAbordaje}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                        value={formData.estado}
                        onValueChange={(val) => handleSelectChange(val, 'estado')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Planificado">Planificado</SelectItem>
                            <SelectItem value="En Curso">En Curso</SelectItem>
                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="horaInicio">Hora Inicio *</Label>
                    <Input
                        id="horaInicio"
                        name="horaInicio"
                        type="time"
                        required
                        value={formData.horaInicio}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="horaFin">Hora Fin *</Label>
                    <Input
                        id="horaFin"
                        name="horaFin"
                        type="time"
                        required
                        value={formData.horaFin}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tipoAbordaje">Tipo de Abordaje</Label>
                    <Input
                        id="tipoAbordaje"
                        name="tipoAbordaje"
                        placeholder="Ej: Médico, Social, Educativo"
                        value={formData.tipoAbordaje}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="participantesEstimados">Participantes Estimados</Label>
                    <Input
                        id="participantesEstimados"
                        name="participantesEstimados"
                        type="number"
                        value={formData.participantesEstimados}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="recursosAdicionales">Recursos Adicionales</Label>
                <Textarea
                    id="recursosAdicionales"
                    name="recursosAdicionales"
                    placeholder="Materiales, equipos, etc."
                    rows={2}
                    value={formData.recursosAdicionales}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-y bg-gray-50/50 -mx-1 px-3 rounded-md">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="transporte"
                        checked={formData.transporte || false}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'transporte')}
                    />
                    <Label htmlFor="transporte" className="text-sm font-normal cursor-pointer">Transporte</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="refrigerios"
                        checked={formData.refrigerios || false}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'refrigerios')}
                    />
                    <Label htmlFor="refrigerios" className="text-sm font-normal cursor-pointer">Refrigerios</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="espacioCubierto"
                        checked={formData.espacioCubierto || false}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'espacioCubierto')}
                    />
                    <Label htmlFor="espacioCubierto" className="text-sm font-normal cursor-pointer">Espacio Cubierto</Label>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notasLogistica">Notas de Logística</Label>
                <Textarea
                    id="notasLogistica"
                    name="notasLogistica"
                    rows={2}
                    value={formData.notasLogistica}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notas">Observaciones Generales</Label>
                <Textarea
                    id="notas"
                    name="notas"
                    rows={2}
                    value={formData.notas}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        submitLabel || (initialData ? 'Actualizar Abordaje' : 'Guardar Abordaje')
                    )}
                </Button>
            </div>
        </form>
    );
}
