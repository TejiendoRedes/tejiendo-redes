'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Enfermedad } from '@/db/schema/enfermedades';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { getPathologyTypes } from '@/data/pathology-types';

export interface EnfermedadFormProps {
    initialData?: Enfermedad;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function EnfermedadForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel
}: EnfermedadFormProps) {
    const initialFormState = {
        codigoEnfermedad: initialData?.codigoEnfermedad || '',
        nombreEnfermedad: initialData?.nombreEnfermedad || '',
        tipoPatologia: initialData?.tipoPatologia || '',
        descripcion: initialData?.descripcion || '',
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
                    value={formData.codigoEnfermedad}
                    disabled={true}
                    placeholder="Generado automáticamente"
                    className="bg-gray-100"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                    id="nombre"
                    value={formData.nombreEnfermedad}
                    onChange={(e) => setFormData({ ...formData, nombreEnfermedad: e.target.value })}
                    required
                    maxLength={100}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Patología *</Label>
                <SearchableSelect
                    items={getPathologyTypes()}
                    value={formData.tipoPatologia}
                    onValueChange={(value) => setFormData({ ...formData, tipoPatologia: value })}
                    placeholder="Seleccionar tipo de patología..."
                    searchPlaceholder="Buscar tipo de patología..."
                    idField="nombre"
                    labelField="nombre"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                    id="descripcion"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="min-h-[100px]"
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
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Actualizar Enfermedad' : 'Guardar Enfermedad'))}
                </Button>
            </div>
        </form>
    );
}
