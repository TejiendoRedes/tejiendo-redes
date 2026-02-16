'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, FileText, Download, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MantenimientoPage() {
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = async () => {
        try {
            setIsBackingUp(true);
            toast.info('Iniciando copia de seguridad...');

            const response = await fetch('/api/backup');

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.details || 'Error al generar la copia de seguridad');
            }

            // Create a blob from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Get filename from header if possible, otherwise generate one
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `backup-sistema-${new Date().toISOString().split('T')[0]}.sql`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Copia de seguridad descargada exitosamente');
        } catch (error: any) {
            console.error('Backup error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsBackingUp(false);
        }
    };

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
                    {/* Backup Card */}
                    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Database className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Base de Datos</CardTitle>
                                    <CardDescription>Copia de seguridad y restauración</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Recomendación
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Se recomienda realizar una copia de seguridad semanalmente para asegurar la integridad de los datos.
                                    Guarde el archivo .sql en una ubicación segura fuera de este equipo.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleBackup}
                                    disabled={isBackingUp}
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                                >
                                    {isBackingUp ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Generando Copia...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-5 w-5" />
                                            Descargar Copia de Seguridad
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-gray-500">
                                    Formato: SQL (Compatible con MySQL/MariaDB)
                                </p>
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
                                    Descargue el manual de usuario actualizado para aprender a utilizar todas las funciones del sistema,
                                    incluyendo el módulo de Abordajes y Farmacia.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    disabled={true} // Placeholder until file is available
                                    variant="outline"
                                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 h-12 text-lg"
                                >
                                    <Download className="mr-2 h-5 w-5" />
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
