'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, MapPin, Users, FileText, Plus, Pill, Truck, Coffee, Sun, Info } from 'lucide-react';
import { EmptyState } from '@/components/shared/UIComponents';
import {
    EditAbordajeModal,
    AddComunidadModal,
    AddTejedorModal,
    RegisterMedicamentoModal
} from './AbordajeModals';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAbordaje } from '@/actions/abordajes-actions';
import { toast } from 'sonner';

interface AbordajeDetailClientProps {
    abordajeData: any;
}

export function AbordajeDetailClient({ abordajeData }: AbordajeDetailClientProps) {
    const router = useRouter();
    const [showEdit, setShowEdit] = useState(false);
    const [showAddComunidad, setShowAddComunidad] = useState(false);
    const [showAddTejedor, setShowAddTejedor] = useState(false);
    const [showRegisterMeds, setShowRegisterMeds] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    if (!abordajeData) {
        return (
            <MainLayout>
                <EmptyState
                    icon="error"
                    title="Abordaje no encontrado"
                    description="El abordaje que buscas no existe o fue eliminado"
                    action={{
                        label: 'Volver a abordajes',
                        onClick: () => router.push('/abordajes'),
                    }}
                />
            </MainLayout>
        );
    }

    const { id } = abordajeData;
    const medicamentosEntregados = abordajeData.medicamentos_entregados || [];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl text-gray-900">{abordajeData.descripcion}</h1>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{abordajeData.codigoAbordaje}</span>
                                <span>•</span>
                                <span className={
                                    abordajeData.estado === 'Finalizado' ? 'text-green-600 font-medium' :
                                        abordajeData.estado === 'En Curso' ? 'text-blue-600 font-medium' :
                                            'text-gray-500'
                                }>
                                    {abordajeData.estado}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2">
                            Eliminar
                        </Button>
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <AlertDialogContent className="bg-white p-6 rounded-lg max-w-md w-full">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el abordaje
                                        {abordajeData.consultas?.length > 0 && " (Nota: Si hay consultas asociadas, la eliminación fallará por seguridad)"}.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4 flex justify-end gap-2">
                                    <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => {
                                        const res = await deleteAbordaje(abordajeData.codigoAbordaje);
                                        if (res.success) {
                                            toast.success('Abordaje eliminado exitosamente');
                                            router.push('/abordajes');
                                        } else {
                                            toast.error(res.error || 'No se pudo eliminar el abordaje');
                                            setShowDeleteDialog(false);
                                        }
                                    }} className="bg-red-600 hover:bg-red-700 text-white">
                                        Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" onClick={() => setShowEdit(true)}>
                            Editar Abordaje
                        </Button>
                    </div>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Fecha</p>
                                    <p className="text-lg">
                                        {new Date(abordajeData.fechaAbordaje).toLocaleDateString('es-VE')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Horario</p>
                                    <p className="text-lg">
                                        {abordajeData.horaInicio}
                                        {abordajeData.horaFin && ` - ${abordajeData.horaFin}`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Consultas</p>
                                    <p className="text-lg">{abordajeData.total_consultas}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Pacientes Únicos</p>
                                    <p className="text-lg">{abordajeData.pacientes_unicos}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="comunidades" className="w-full">
                    <TabsList>
                        <TabsTrigger value="comunidades">
                            Comunidades ({abordajeData.comunidades?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="tejedores">
                            Tejedores ({abordajeData.tejedores?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="consultas">
                            Consultas ({abordajeData.consultas?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="medicamentos">
                            Medicamentos ({medicamentosEntregados.length})
                        </TabsTrigger>
                        <TabsTrigger value="detalles">
                            Detalles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="comunidades">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowAddComunidad(true)} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Agregar Comunidad
                            </Button>
                        </div>
                        {abordajeData.comunidades && abordajeData.comunidades.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {abordajeData.comunidades.map((comunidad: any) => (
                                    <Card key={comunidad.codigoComunidad}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{comunidad.nombreComunidad}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-600" />
                                                <span>
                                                    {comunidad.parroquia}, {comunidad.municipio}, {comunidad.estado}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="w-4 h-4 text-gray-600" />
                                                <span>{comunidad.habitantes} habitantes</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="info"
                                title="Sin comunidades asignadas"
                                description="Este abordaje no tiene comunidades asignadas"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="tejedores">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowAddTejedor(true)} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Agregar Tejedor
                            </Button>
                        </div>
                        {abordajeData.tejedores && abordajeData.tejedores.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {abordajeData.tejedores.map((tejedor: any) => (
                                    <Card key={tejedor.cedulaTejedor}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-2">
                                                <p className="text-base font-medium">
                                                    {tejedor.nombreTejedor} {tejedor.apellidoTejedor}
                                                </p>
                                                <Badge variant="secondary">{tejedor.rolAbordaje || 'Participante'}</Badge>
                                                <p className="text-sm text-gray-600">C.I. {tejedor.cedulaTejedor}</p>
                                                <p className="text-xs text-gray-500">{tejedor.profesionTejedor}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="info"
                                title="Sin tejedores asignados"
                                description="Este abordaje no tiene tejedores asignados"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="consultas">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => router.push(`/abordajes/${abordajeData.codigoAbordaje}/nueva-consulta`)} size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Nueva Consulta
                            </Button>
                        </div>
                        {abordajeData.consultas && abordajeData.consultas.length > 0 ? (
                            <div className="space-y-4">
                                {abordajeData.consultas.map((consulta: any) => (
                                    <Card key={consulta.codigoConsulta}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{consulta.codigoConsulta}</CardTitle>
                                                <Badge variant="outline">{new Date(consulta.fechaConsulta).toLocaleDateString()}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Paciente</p>
                                                <p className="text-base">C.I. {consulta.cedulaPaciente}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Motivo</p>
                                                <p className="text-base">{consulta.motivoConsulta}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Diagnóstico</p>
                                                <p className="text-base">{consulta.diagnosticoTexto}</p>
                                            </div>
                                            {consulta.tensionArterial && (
                                                <div>
                                                    <p className="text-sm text-gray-600 font-medium">Tensión Arterial</p>
                                                    <Badge variant="secondary" className="text-sm font-mono mt-1">
                                                        {consulta.tensionArterial}
                                                    </Badge>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="info"
                                title="Sin consultas registradas"
                                description="Este abordaje no tiene consultas médicas registradas"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="medicamentos">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowRegisterMeds(true)} size="sm" className="gap-2">
                                <Pill className="w-4 h-4" /> Registrar Entrega
                            </Button>
                        </div>
                        {medicamentosEntregados.length > 0 ? (
                            <div className="space-y-4">
                                {medicamentosEntregados.map((entrega: any, index: number) => (
                                    <Card key={index}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-lg font-medium text-gray-900">{entrega.nombreMedicamento}</p>
                                                        <p className="text-sm text-gray-500">{entrega.codigoMedicamento}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Paciente</p>
                                                            <p className="text-sm font-medium">C.I. {entrega.cedulaPaciente}</p>
                                                        </div>
                                                        {entrega.cedulaTejedor && (
                                                            <div>
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Entregado por</p>
                                                                <p className="text-sm font-medium">C.I. {entrega.cedulaTejedor}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {entrega.indicaciones && (
                                                        <div className="mt-2 bg-gray-50 p-2 rounded text-sm text-gray-700">
                                                            <span className="font-semibold">Indicaciones:</span> {entrega.indicaciones}
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
                                                    {entrega.cantidadEntregada} {entrega.cantidadEntregada === 1 ? 'unidad' : 'unidades'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon="info"
                                title="Sin entregas de medicamentos"
                                description="No hay medicamentos entregados en este abordaje"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="detalles">
                        <div className="grid grid-cols-1 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        Información y Observaciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Tipo de Abordaje</p>
                                            <p className="text-base font-medium">{abordajeData.tipoAbordaje || 'No especificado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Participantes Estimados</p>
                                            <p className="text-base font-medium">{abordajeData.participantesEstimados || 'No especificado'}</p>
                                        </div>
                                    </div>

                                    {abordajeData.recursosAdicionales && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500 mb-1">Recursos Adicionales</p>
                                            <p className="text-sm bg-gray-50 p-4 rounded-lg">{abordajeData.recursosAdicionales}</p>
                                        </div>
                                    )}
                                    {abordajeData.notas && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500 mb-1">Observaciones Generales</p>
                                            <p className="text-sm bg-gray-50 p-4 rounded-lg">{abordajeData.notas}</p>
                                        </div>
                                    )}
                                    {abordajeData.codigoSolicitud && (
                                        <div className="pt-4 border-t">
                                            <p className="text-xs text-gray-400">Originado de la solicitud: {abordajeData.codigoSolicitud}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                <EditAbordajeModal
                    open={showEdit}
                    onOpenChange={setShowEdit}
                    abordaje={abordajeData}
                />

                <AddComunidadModal
                    open={showAddComunidad}
                    onOpenChange={setShowAddComunidad}
                    abordajeId={abordajeData.codigoAbordaje}
                    existingIds={abordajeData.comunidades?.map((c: any) => c.codigoComunidad) || []}
                />

                <AddTejedorModal
                    open={showAddTejedor}
                    onOpenChange={setShowAddTejedor}
                    abordajeId={abordajeData.codigoAbordaje}
                    existingIds={abordajeData.tejedores?.map((t: any) => t.cedulaTejedor) || []}
                />

                <RegisterMedicamentoModal
                    open={showRegisterMeds}
                    onOpenChange={setShowRegisterMeds}
                    abordajeId={abordajeData.codigoAbordaje}
                    fechaAbordaje={abordajeData.fechaAbordaje}
                />
            </div>
        </MainLayout>
    );
}
