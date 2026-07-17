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
        existencia: initialData?.existencia?.toString() || '',
        precio: initialData?.precio?.toString() || '',
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
                <Label htmlFor="nombre">Nombre <span className="text-red-500 font-bold">*</span></Label>
                <Input
                    id="nombre"
                    value={formData.nombreMedicamento}
                    onChange={(e) => setFormData({ ...formData, nombreMedicamento: e.target.value })}
                    required
                    maxLength={100}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="presentacion">Presentación <span className="text-red-500 font-bold">*</span></Label>
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
                <Label htmlFor="descripcion">Descripción <span className="text-red-500 font-bold">*</span></Label>
                <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    className="min-h-[100px]"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="precio">Precio <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        type="number"
                        id="precio"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        required
                        min={0}
                        step="0.01"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="existencia">
                        {initialData ? 'Existencia' : 'Existencia Inicial *'}
                    </Label>
                    <Input
                        type="number"
                        id="existencia"
                        value={formData.existencia}
                        onChange={(e) => setFormData({ ...formData, existencia: e.target.value })}
                        required
                        min={0}
                        disabled={!!initialData}
                        className={initialData ? "bg-gray-100" : ""}
                    />
                    {initialData && (
                        <p className="text-xs text-amber-600 font-medium">
                            Nota: La existencia se actualiza automáticamente a través de las entregas y reabastecimientos.
                        </p>
                    )}
                </div>
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
