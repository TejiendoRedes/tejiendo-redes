'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Medicamento } from '@/db/schema/medicamentos';

export interface MedicamentoFormProps {
    initialData?: Medicamento;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function MedicamentoForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: MedicamentoFormProps) {
    const initialFormState = {
        codigoMedicamento: initialData?.codigoMedicamento || '',
        nombreMedicamento: initialData?.nombreMedicamento || '',
        presentacion: initialData?.presentacion || '',
        descripcion: initialData?.descripcion || '',
        existencia: initialData?.existencia || 0,
        precio: initialData?.precio || 0,
    };

    const [formData, setFormData] = React.useState(initialFormState);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                    id="codigo"
                    value={formData.codigoMedicamento}
                    disabled={true}
                    placeholder="Generado automáticamente"
                    className="bg-gray-100"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                    id="nombre"
                    value={formData.nombreMedicamento}
                    onChange={(e) => setFormData({ ...formData, nombreMedicamento: e.target.value })}
                    required
                    maxLength={100}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="presentacion">Presentación *</Label>
                <Input
                    id="presentacion"
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    required
                    maxLength={100}
                    placeholder="Ej. Tabletas 500mg, Jarabe 120ml"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="precio">Precio *</Label>
                <Input
                    type="number"
                    id="precio"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    required
                    min={0}
                    step="0.01"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="existencia">
                    {initialData ? 'Existencia' : 'Existencia Inicial *'}
                </Label>
                {initialData ? (
                    <>
                        <Input
                            type="number"
                            id="existencia"
                            value={formData.existencia}
                            disabled
                            className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">
                            El stock se ajusta automáticamente con las entregas y cancelaciones registradas en Farmacia.
                        </p>
                    </>
                ) : (
                    <Input
                        type="number"
                        id="existencia"
                        value={formData.existencia}
                        onChange={(e) => setFormData({ ...formData, existencia: parseInt(e.target.value) || 0 })}
                        required
                        min={0}
                    />
                )}
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
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Actualizar Medicamento' : 'Guardar Medicamento'))}
                </Button>
            </div>
        </form>
    );
}
