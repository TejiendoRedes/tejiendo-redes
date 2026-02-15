'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, ClipboardList, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { searchGlobal, SearchResult } from '@/actions/global-search-actions';
import { checkInPatient, getAbordajeAsistencia } from '@/actions/abordajes-actions';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AbordajeAsistencia {
    id: number;
    cedulaPaciente: string;
    horaLlegada: Date;
    estado: string;
    serviciosRequeridos: string | null;
    paciente: {
        nombre: string;
        apellido: string;
    };
}

export function ReceptionStation({ abordaje }: { abordaje: any }) {
    const params = useParams();
    const router = useRouter();
    const abordajeId = abordaje.codigoAbordaje;

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // Queue State
    const [waitingList, setWaitingList] = useState<AbordajeAsistencia[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Waiting List
    useEffect(() => {
        let mounted = true;
        const fetchList = async () => {
            setIsLoadingList(true);
            try {
                const response = await getAbordajeAsistencia(abordajeId);
                if (mounted && response.success && response.data) {
                    setWaitingList(response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (mounted) setIsLoadingList(false);
            }
        };

        fetchList();
        return () => { mounted = false; };
    }, [abordajeId, refreshTrigger]);

    // Handle Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await searchGlobal(searchTerm);
                    setSearchResults(results.pacientes || []);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Check-in Patient
    const handleCheckIn = async (patientId: string, patientName: string) => {
        // Optimistic check: is already in list?
        if (waitingList.some(p => p.cedulaPaciente === patientId)) {
            toast.error('Este paciente ya se encuentra en la lista de espera.');
            return;
        }

        const toastId = toast.loading(`Registrando a ${patientName}...`);

        try {
            const res = await checkInPatient(abordajeId, patientId);
            if (res.success) {
                toast.success(`${patientName} registrado exitosamente`, { id: toastId });
                setSearchTerm(''); // Clear search
                setRefreshTrigger(prev => prev + 1); // Reload list
            } else {
                toast.error(res.error || 'Error al registrar paciente', { id: toastId });
            }
        } catch (error) {
            toast.error('Error de conexión', { id: toastId });
        }
    };

    // Calculate Stats
    const stats = {
        total: waitingList.length,
        waiting: waitingList.filter(p => p.estado === 'En Espera').length,
        attended: waitingList.filter(p => p.estado === 'Finalizado').length,
        inProcess: waitingList.filter(p => ['En Triaje', 'En Consulta', 'En Farmacia'].includes(p.estado)).length
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
            {/* Left Column: Check-in Station & Queue */}
            <div className="lg:col-span-2 space-y-6">
                {/* Search & Check-in */}
                <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                            <Search className="w-5 h-5" />
                            Recepción de Pacientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por Nombre o Cédula..."
                                    className="pl-10 h-10 bg-white border-blue-200 focus-visible:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    </div>
                                )}
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                onClick={() => router.push('/datos-basicos/pacientes/nuevo')}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Nuevo Paciente
                            </Button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchTerm.length >= 2 && (
                            <div className="mt-4 bg-white rounded-lg border border-blue-100 shadow-md divide-y overflow-hidden">
                                {searchResults.length === 0 && !isSearching ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No se encontraron pacientes.
                                        <Button variant="link" className="text-blue-600 h-auto p-0 ml-1">Crear nuevo registro</Button>
                                    </div>
                                ) : (
                                    searchResults.map((result) => {
                                        const isAlreadyInList = waitingList.some(p => p.cedulaPaciente === result.id);
                                        return (
                                            <div key={result.id} className="p-3 hover:bg-blue-50/50 transition-colors flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {result.title.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{result.title}</p>
                                                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                                                    </div>
                                                </div>
                                                {isAlreadyInList ? (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Registrado
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors h-8"
                                                        variant="outline"
                                                        onClick={() => handleCheckIn(result.id, result.title)}
                                                    >
                                                        Check-in
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Waiting List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gray-50/50">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-gray-500" />
                            Cola de Atención
                        </CardTitle>
                        <Badge variant="outline" className="bg-white">
                            {isLoadingList ? <Loader2 className="w-3 h-3 animate-spin" /> : waitingList.length} Pacientes
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoadingList ? (
                            <div className="p-8 text-center text-gray-500">Cargando lista...</div>
                        ) : waitingList.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 bg-gray-50/30">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay pacientes registrados en este abordaje aún.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {waitingList.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                {item.paciente.nombre.charAt(0)}{item.paciente.apellido.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.paciente.nombre} {item.paciente.apellido}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.cedulaPaciente}</span>
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(item.horaLlegada), 'h:mm a')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge className={
                                                item.estado === 'En Espera' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200' :
                                                    item.estado === 'Finalizado' ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' :
                                                        'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                                            } variant="secondary">
                                                {item.estado}
                                            </Badge>

                                            {/* Future: Action Menu */}
                                            {/* <Button variant="ghost" size="icon" className="text-gray-400 group-hover:text-gray-600">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Key Metrics */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Estado del Abordaje</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600 font-medium">Total Pacientes</span>
                                <span className="font-bold text-2xl text-gray-900">{stats.total}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="text-gray-600">En Espera</span>
                                </div>
                                <span className="font-bold">{stats.waiting}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-gray-600">En Proceso</span>
                                </div>
                                <span className="font-bold">{stats.inProcess}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-gray-600">Finalizados</span>
                                </div>
                                <span className="font-bold">{stats.attended}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="bg-blue-50 p-4 rounded text-xs text-blue-700 leading-relaxed">
                                <p className="font-semibold mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Nota Operativa:</p>
                                Los pacientes deben hacer Check-in aquí antes de pasar a las estaciones Médica o de Farmacia.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
