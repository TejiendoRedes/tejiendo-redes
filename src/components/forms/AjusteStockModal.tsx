'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Medicamento } from '@/db/schema/medicamentos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AjusteStockModalProps {
    medicamento: Medicamento;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AjusteStockModal({
    medicamento,
    onSubmit,
    onCancel,
    isLoading = false
}: AjusteStockModalProps) {
    const [formData, setFormData] = React.useState({
        codigoMedicamento: medicamento.codigoMedicamento,
        tipo: 'entrada',
        cantidad: '',
        motivo: 'Compra',
        referencia: '',
        notas: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            ...formData,
            cantidad: Number(formData.cantidad)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md text-sm mb-4 border border-blue-100">
                <span className="font-semibold text-blue-900">{medicamento.nombreMedicamento}</span> ({medicamento.presentacion})<br />
                Existencia Actual: <span className="font-bold text-blue-700">{medicamento.existencia} unidades</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Movimiento <span className="text-red-500">*</span></Label>
                    <Select 
                        value={formData.tipo} 
                        onValueChange={(val) => setFormData({...formData, tipo: val, motivo: val === 'entrada' ? 'Compra' : 'Merma'})}
                    >
                        <SelectTrigger id="tipo">
                            <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="entrada">Entrada (+)</SelectItem>
                            <SelectItem value="salida">Salida (-)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad <span className="text-red-500">*</span></Label>
                    <Input
                        type="number"
                        id="cantidad"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                        required
                        min={1}
                        placeholder="Ej. 50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="motivo">Motivo <span className="text-red-500">*</span></Label>
                <Select 
                    value={formData.motivo} 
                    onValueChange={(val) => setFormData({...formData, motivo: val})}
                >
                    <SelectTrigger id="motivo">
                        <SelectValue placeholder="Seleccione el motivo" />
                    </SelectTrigger>
                    <SelectContent>
                        {formData.tipo === 'entrada' ? (
                            <>
                                <SelectItem value="Compra">Compra / Reabastecimiento</SelectItem>
                                <SelectItem value="Donación">Donación Recibida</SelectItem>
                                <SelectItem value="Ajuste de inventario">Ajuste Positivo</SelectItem>
                                <SelectItem value="Reversión de entrega">Reversión de entrega</SelectItem>
                            </>
                        ) : (
                            <>
                                <SelectItem value="Merma">Merma / Vencimiento</SelectItem>
                                <SelectItem value="Donación externa">Donación Externa</SelectItem>
                                <SelectItem value="Ajuste de inventario">Ajuste Negativo</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="referencia">Referencia / Factura</Label>
                <Input
                    id="referencia"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    placeholder="Opcional. Ej. Factura 1234"
                    maxLength={50}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notas">Notas u Observaciones</Label>
                <Textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Detalles adicionales del movimiento..."
                    className="h-20"
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
                    className="bg-[#1e3a8a] text-white hover:bg-blue-800"
                    disabled={isLoading}
                >
                    {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
                </Button>
            </div>
        </form>
    );
}
