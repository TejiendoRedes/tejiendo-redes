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

    const inputClassName = "h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-gray-700">Código <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="codigo"
                        value={formData.codigoEnfermedad}
                        onChange={(e) => setFormData({ ...formData, codigoEnfermedad: e.target.value.toUpperCase() })}
                        placeholder="Ingrese el código (ej: ENF-001 o CIE-10)"
                        required
                        maxLength={10}
                        className={`${inputClassName} uppercase`}
                        disabled={!!initialData}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-gray-700">Nombre <span className="text-red-500 font-bold">*</span></Label>
                    <Input
                        id="nombre"
                        value={formData.nombreEnfermedad}
                        onChange={(e) => setFormData({ ...formData, nombreEnfermedad: e.target.value })}
                        required
                        maxLength={100}
                        className={`${inputClassName} font-medium`}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-gray-700">Tipo de Patología <span className="text-red-500 font-bold">*</span></Label>
                    <SearchableSelect
                        items={getPathologyTypes()}
                        value={formData.tipoPatologia}
                        onValueChange={(value) => setFormData({ ...formData, tipoPatologia: value })}
                        placeholder="Seleccionar tipo de patología..."
                        searchPlaceholder="Buscar tipo de patología..."
                        idField="nombre"
                        labelField="nombre"
                        id="tipo"
                        // El SearchableSelect usa su propio estilo internamente, pero se integra bien.
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-gray-700">Descripción</Label>
                    <Textarea
                        id="descripcion"
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all py-3"
                    />
                </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-6 border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 bg-[#1e3a8a] hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 font-medium"
                >
                    {isLoading ? 'Guardando...' : (submitLabel || (initialData ? 'Actualizar Enfermedad' : 'Guardar Enfermedad'))}
                </Button>
            </div>
        </form>
    );
}
