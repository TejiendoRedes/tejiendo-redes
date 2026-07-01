'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useState } from 'react';

interface Community {
    codigoComunidad: string;
    nombreComunidad: string;
}

interface DashboardFiltersProps {
    communities: Community[];
}

export function DashboardFilters({ communities }: DashboardFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [fechaInicio, setFechaInicio] = useState(searchParams.get('fechaInicio') || '');
    const [fechaFin, setFechaFin] = useState(searchParams.get('fechaFin') || '');
    const [comunidad, setComunidad] = useState(searchParams.get('comunidad') || 'todas');

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (fechaInicio) params.set('fechaInicio', fechaInicio);
        else params.delete('fechaInicio');

        if (fechaFin) params.set('fechaFin', fechaFin);
        else params.delete('fechaFin');

        if (comunidad && comunidad !== 'todas') params.set('comunidad', comunidad);
        else params.delete('comunidad');

        // ABD-03: Corregir redirección para mantenerse en la página de estadísticas
        router.push(`/estadisticas?${params.toString()}`);
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="w-5 h-5" />
                    Filtros Globales
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                        <Input
                            id="fechaInicio"
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fechaFin">Fecha Fin</Label>
                        <Input
                            id="fechaFin"
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comunidad">Comunidad</Label>
                        <Select value={comunidad} onValueChange={setComunidad}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las comunidades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas</SelectItem>
                                {communities.map((c) => (
                                    <SelectItem key={c.codigoComunidad} value={c.codigoComunidad}>
                                        {c.nombreComunidad}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={applyFilters} className="w-full rounded-xl bg-[#1e3a8a] hover:bg-blue-900 shadow-sm text-white">
                        Aplicar Filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
