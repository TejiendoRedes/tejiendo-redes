'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X, Users, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { addTejedorToAbordaje, removeTejedorFromAbordaje } from '@/actions/abordajes-actions';
import { getTejedores } from '@/queries/tejedores';;

import { AbordajeWithRelations } from '@/types/app-types';

interface TeamStationProps {
    abordaje: AbordajeWithRelations;
}

export function TeamStation({ abordaje }: TeamStationProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [allTejedores, setAllTejedores] = useState<any[]>([]);
    const [selectedTejedor, setSelectedTejedor] = useState<string>('');
    const [rol, setRol] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingRol, setEditingRol] = useState<string | null>(null);
    const [newRol, setNewRol] = useState<string>('');

    // Fetch all tejedores for the dropdown
    useEffect(() => {
        const fetchTejedores = async () => {
            const res = await getTejedores();
            if (res.success) {
                setAllTejedores(res.data || []);
            }
        };
        fetchTejedores();
    }, []);

    const tejedoresAsociados = abordaje.tejedores || [];

    const handleAddTejedor = async () => {
        if (!selectedTejedor) {
            toast.error('Debes seleccionar un tejedor');
            return;
        }

        setIsLoading(true);
        try {
            const res = await addTejedorToAbordaje(abordaje.codigoAbordaje, selectedTejedor, rol);
            if (res.success) {
                toast.success('Tejedor agregado exitosamente');
                setOpen(false);
                setSelectedTejedor('');
                setRol('');
                router.refresh(); // Trigger data revalidation
            } else {
                toast.error(res.error || 'Error al agregar el tejedor');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTejedor = async (cedulaTejedor: string, nombreTejedor: string) => {
        if (!confirm(`¿Estás seguro de quitar "${nombreTejedor}" de este abordaje?`)) return;

        try {
            const res = await removeTejedorFromAbordaje(abordaje.codigoAbordaje, cedulaTejedor);
            if (res.success) {
                toast.success('Tejedor removido exitosamente');
                router.refresh(); // Trigger data revalidation
            } else {
                toast.error(res.error || 'Error al remover el tejedor');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    // Filter out already associated tejedores
    const availableTejedores = allTejedores.filter(
        t => !tejedoresAsociados.some((at: any) => at.cedulaTejedor === t.cedulaTejedor)
    );

    // Role suggestions
    const roleSuggestions = ['Coordinador', 'Médico', 'Farmacia', 'Logística', 'Apoyo'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipo (Tejedores)</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona los tejedores participantes y sus roles
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Tejedor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Tejedor al Abordaje</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tejedor</label>
                                <SearchableSelect
                                    items={availableTejedores}
                                    value={selectedTejedor}
                                    onValueChange={setSelectedTejedor}
                                    placeholder="Seleccionar tejedor..."
                                    searchPlaceholder="Buscar tejedor..."
                                    idField="cedulaTejedor"
                                    labelField="nombreTejedor"
                                    secondaryLabelField="profesionTejedor"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Rol en Abordaje (Opcional)</label>
                                <Input
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value)}
                                    placeholder="Ej: Coordinador, Médico, etc."
                                    list="role-suggestions"
                                />
                                <datalist id="role-suggestions">
                                    {roleSuggestions.map(r => <option key={r} value={r} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleAddTejedor} disabled={isLoading}>
                                    {isLoading ? 'Agregando...' : 'Agregar'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tejedoresAsociados.length === 0 ? (
                    <Card className="col-span-full p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No hay tejedores asociados a este abordaje</p>
                        <p className="text-sm mt-1">Haz clic en "Agregar Tejedor" para comenzar</p>
                    </Card>
                ) : (
                    tejedoresAsociados.map((tej: any) => (
                        <Card key={tej.cedulaTejedor} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">
                                        {tej.nombreTejedor} {tej.apellidoTejedor}
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveTejedor(
                                        tej.cedulaTejedor,
                                        `${tej.nombreTejedor} ${tej.apellidoTejedor}`
                                    )}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><strong>Cédula:</strong> {tej.cedulaTejedor}</p>
                                {tej.profesionTejedor && (
                                    <p><strong>Profesión:</strong> {tej.profesionTejedor}</p>
                                )}
                                <div className="pt-2 border-t">
                                    {tej.rolAbordaje ? (
                                        <Badge variant="secondary" className="text-xs">
                                            {tej.rolAbordaje}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs italic text-gray-400">Sin rol asignado</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
