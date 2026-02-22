'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Database,
    FileText,
    Download,
    Loader2,
    AlertTriangle,
    CheckCircle,
    RefreshCcw,
    Calendar,
    Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import { updateConfiguracionBackup, triggerManualBackup } from '@/actions/mantenimiento-actions';
import { getConfiguracionBackup } from '@/queries/mantenimiento-actions';;
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MantenimientoPage() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getConfiguracionBackup();
            if (result.success) {
                setConfig(result.data);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error loading config:', error);
            toast.error('Error al cargar la configuración');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleRefreshBackup = async () => {
        try {
            setIsBackingUp(true);
            toast.info('Generando copia de seguridad en el servidor...');

            const result = await triggerManualBackup();

            if (result.success) {
                toast.success('Copia de seguridad generada exitosamente');
                loadConfig(); // Recargar para ver la nueva fecha
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Backup error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsBackingUp(false);
        }
    };


    const handleFrequencyChange = async (value: string) => {
        try {
            setIsUpdating(true);
            const result = await updateConfiguracionBackup({ frecuencia: value });
            if (result.success) {
                setConfig((prev: any) => ({ ...prev, frecuencia: value }));
                toast.success('Frecuencia actualizada');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Error al actualizar la frecuencia');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto py-8 px-4 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mantenimiento del Sistema</h1>
                    <p className="text-gray-500 mt-2">
                        Gestión de copias de seguridad y recursos de ayuda.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Backup Management Card */}
                    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all md:col-span-2">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Database className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Gestión de Base de Datos</CardTitle>
                                        <CardDescription>Configuración de copias de seguridad automáticas</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleRefreshBackup}
                                        disabled={isBackingUp}
                                        variant="outline"
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >
                                        {isBackingUp ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCcw className="mr-2 h-4 w-4" />
                                        )}
                                        Refrescar
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Frequency Selector */}
                                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                        <Settings2 className="w-4 h-4" />
                                        Frecuencia de Backup
                                    </div>
                                    <Select
                                        value={config?.frecuencia}
                                        onValueChange={handleFrequencyChange}
                                        disabled={isUpdating}
                                    >
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Seleccionar frecuencia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cada 3 días">Cada 3 días (Mínima)</SelectItem>
                                            <SelectItem value="semanal">Semanal</SelectItem>
                                            <SelectItem value="mensual">Mensual</SelectItem>
                                            <SelectItem value="manual">Solo Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">
                                        La frecuencia determina cuándo el sistema genera automáticamente un respaldo.
                                    </p>
                                </div>

                                {/* Status - Last Backup */}
                                <div className="space-y-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                                        <Calendar className="w-4 h-4" />
                                        Última Copia
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                        {config?.ultimaCopia
                                            ? format(new Date(config.ultimaCopia), 'dd MMM, HH:mm', { locale: es })
                                            : 'No registrada'
                                        }
                                    </div>
                                    <p className="text-xs text-blue-600">
                                        Estado: <span className="font-semibold text-green-600">Correcto</span>
                                    </p>
                                </div>

                                {/* Next Scheduled */}
                                <div className="space-y-2 p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-2 text-green-800 font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        Próxima Programada
                                    </div>
                                    <div className="text-2xl font-bold text-green-900">
                                        {config?.proximaCopia
                                            ? format(new Date(config.proximaCopia), 'dd MMM p', { locale: es })
                                            : config?.frecuencia === 'manual' ? 'No programada' : 'Calculando...'
                                        }
                                    </div>
                                    <p className="text-xs text-green-600 italic">
                                        {config?.frecuencia === 'manual'
                                            ? 'Requiere acción manual'
                                            : `Basado en frecuencia ${config?.frecuencia}`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-100 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Nota de Seguridad</p>
                                    <p className="mt-1">
                                        Las copias de seguridad automáticas se almacenan de forma segura en el servidor.
                                        Para mayor seguridad, descargue periódicamente una copia y guárdela en un dispositivo externo.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manual Card */}
                    <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Manual de Usuario</CardTitle>
                                    <CardDescription>Documentación y guías de uso</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-md border border-green-100">
                                <h4 className="font-medium text-green-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Disponible
                                </h4>
                                <p className="text-sm text-green-700 mt-1">
                                    Descargue el manual de usuario actualizado para aprender a utilizar todas las funciones del sistema.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    disabled={true}
                                    variant="outline"
                                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 h-10"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar Manual (PDF)
                                </Button>
                                <p className="text-xs text-center text-gray-500">
                                    Próximamente disponible
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </MainLayout>
    );
}
