'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateAbordaje, deleteAbordaje } from '@/actions/abordajes-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    MapPin,
    Users,
    Stethoscope,
    BarChart,
    Truck,
    CheckCircle,
    X,
    MoreVertical,
    CheckCircle2,
    Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { CommunityStation } from './stations/CommunityStation';
import { TeamStation } from './stations/TeamStation';
import { OperationsStation } from './stations/OperationsStation';
import { HistoryStation } from './stations/HistoryStation';

interface AbordajeDashboardProps {
    abordaje: any;
}

export function AbordajeDashboard({ abordaje }: AbordajeDashboardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('comunidades');
    const [isLoading, setIsLoading] = useState(false);

    const handleFinalize = async () => {
        if (!confirm('¿Estás seguro de finalizar este abordaje? No podrás realizar más cambios después.')) return;

        setIsLoading(true);
        try {
            const res = await updateAbordaje(abordaje.codigoAbordaje, { estado: 'Finalizado' });
            if (res.success) {
                toast.success('Abordaje finalizado correctamente');
                router.refresh();
            } else {
                toast.error(res.error || 'Error al finalizar el abordaje');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este abordaje? Esta acción no se puede deshacer y borrará toda la información asociada.')) return;

        setIsLoading(true);
        try {
            const res = await deleteAbordaje(abordaje.codigoAbordaje);
            if (res.success) {
                toast.success('Abordaje eliminado correctamente');
                router.push('/abordajes');
                return;
            } else {
                toast.error(res.error || 'Error al eliminar el abordaje');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    // Logistics info badges
    const logisticsBadges = [
        { show: abordaje.transporte, icon: Truck, label: 'Transporte', color: 'bg-blue-100 text-blue-700' },
        { show: abordaje.refrigerios, icon: CheckCircle, label: 'Refrigerios', color: 'bg-green-100 text-green-700' },
        { show: abordaje.espacioCubierto, icon: CheckCircle, label: 'Espacio Cubierto', color: 'bg-purple-100 text-purple-700' },
    ].filter(b => b.show);

    return (
        <div className="space-y-6">
            {/* HEADER GLOBAL STICKY */}
            <div className="bg-white border-b sticky top-0 z-10 -mx-6 px-6 py-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {abordaje.descripcion}
                                <span className="text-gray-400 font-normal text-base">
                                    / {abordaje.codigoAbordaje}
                                </span>
                            </h1>
                            <Badge variant={
                                abordaje.estado === 'Finalizado' ? 'default' :
                                    abordaje.estado === 'En Curso' ? 'secondary' : 'outline'
                            }>
                                {abordaje.estado}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(abordaje.fechaAbordaje).toLocaleDateString()}
                            </span>
                            {/* Logistics Info Badges */}
                            {logisticsBadges.map((badge, idx) => (
                                <span key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
                                    <badge.icon className="w-3 h-3" />
                                    {badge.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        className="shadow-sm bg-blue-600 hover:bg-blue-700"
                        onClick={handleFinalize}
                        disabled={isLoading || abordaje.estado === 'Finalizado'}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {isLoading ? 'Finalizando...' : 'Finalizar Abordaje'}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/abordajes/${abordaje.codigoAbordaje}/editar`)}>
                                Editar Datos Básicos
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDelete}>
                                Eliminar Abordaje
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* MAIN NAVIGATION TABS */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="border-b bg-white px-2 rounded-lg border">
                    <TabsList className="h-12 w-full justify-start gap-6 bg-transparent p-0">
                        <TabsTrigger
                            value="comunidades"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Comunidades
                        </TabsTrigger>
                        <TabsTrigger
                            value="equipo"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Equipo
                        </TabsTrigger>
                        <TabsTrigger
                            value="operaciones"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
                        >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Operaciones
                        </TabsTrigger>
                        <TabsTrigger
                            value="historial"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 h-full"
                        >
                            <BarChart className="w-4 h-4 mr-2" />
                            Historial
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB CONTENTS */}
                <div className="min-h-[500px]">
                    <TabsContent value="comunidades" className="mt-0">
                        <CommunityStation abordaje={abordaje} />
                    </TabsContent>

                    <TabsContent value="equipo" className="mt-0">
                        <TeamStation abordaje={abordaje} />
                    </TabsContent>

                    <TabsContent value="operaciones" className="mt-0">
                        <OperationsStation abordaje={abordaje} />
                    </TabsContent>

                    <TabsContent value="historial" className="mt-0">
                        <HistoryStation abordaje={abordaje} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
