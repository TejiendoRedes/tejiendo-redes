'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, Users, FileText, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/UIComponents';
import {
    EditAbordajeModal,
    AddComunidadModal,
    AddTejedorModal,
    RegisterMedicamentoModal
} from './AbordajeModals';
import { ComunidadesTab } from './tabs/ComunidadesTab';
import { TejedoresTab } from './tabs/TejedoresTab';
import { ConsultasTab } from './tabs/ConsultasTab';
import { MedicamentosTab } from './tabs/MedicamentosTab';
import { DetallesTab } from './tabs/DetallesTab';
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

import { AbordajeWithRelations } from '@/types/app-types';

interface AbordajeDetailClientProps {
    abordajeData: AbordajeWithRelations;
}

export function AbordajeDetailClient({ abordajeData }: AbordajeDetailClientProps) {
    const router = useRouter();
    const [showEdit, setShowEdit] = useState(false);
    const [showAddComunidad, setShowAddComunidad] = useState(false);
    const [showAddTejedor, setShowAddTejedor] = useState(false);
    const [showRegisterMeds, setShowRegisterMeds] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');

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
                        <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
                            setShowDeleteDialog(open);
                            if (!open) setConfirmText('');
                        }}>
                            <AlertDialogContent className="bg-white p-6 rounded-lg max-w-md w-full border-red-200 border-2">
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3 text-red-600 mb-2">
                                        <AlertTriangle className="w-8 h-8" />
                                        <AlertDialogTitle className="text-xl">¿Eliminar Abordaje Permanentemente?</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="space-y-3">
                                        <div className="bg-red-50 p-3 rounded-md border border-red-100 text-red-800 text-sm">
                                            <p className="font-semibold mb-1">¡ADVERTENCIA DE SEGURIDAD!</p>
                                            <p>Esta acción es <strong>IRREVERSIBLE</strong> y eliminará en cascada:</p>
                                            <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5">
                                                <li>El abordaje <strong>{abordajeData.codigoAbordaje}</strong></li>
                                                <li>Todas las <strong>{abordajeData.consultas?.length || 0} consultas médicas</strong> asociadas</li>
                                                <li>Todos los registros de asistencia</li>
                                                <li>Las entregas de medicamentos vinculadas</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            <Label htmlFor="confirm-delete" className="text-gray-700 font-medium">
                                                Para confirmar, escriba <span className="font-mono font-bold text-red-600">ELIMINAR</span> a continuación:
                                            </Label>
                                            <Input
                                                id="confirm-delete"
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                placeholder="Escriba ELIMINAR"
                                                className="border-red-300 focus-visible:ring-red-500"
                                            />
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 flex justify-end gap-3">
                                    <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancelar</AlertDialogCancel>
                                    <Button
                                        variant="destructive"
                                        disabled={confirmText !== 'ELIMINAR'}
                                        onClick={async () => {
                                            const res = await deleteAbordaje(abordajeData.codigoAbordaje);
                                            if (res.success) {
                                                toast.success('Abordaje y todos sus datos asociados fueron eliminados permanentemente');
                                                router.push('/abordajes');
                                            } else {
                                                toast.error(res.error || 'No se pudo eliminar el abordaje');
                                                setShowDeleteDialog(false);
                                            }
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                                    >
                                        ELIMINAR DEFINITIVAMENTE
                                    </Button>
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
                        <ComunidadesTab
                            comunidades={abordajeData.comunidades}
                            onAdd={() => setShowAddComunidad(true)}
                        />
                    </TabsContent>

                    <TabsContent value="tejedores">
                        <TejedoresTab
                            tejedores={abordajeData.tejedores}
                            onAdd={() => setShowAddTejedor(true)}
                        />
                    </TabsContent>

                    <TabsContent value="consultas">
                        <ConsultasTab
                            consultas={abordajeData.consultas}
                            codigoAbordaje={abordajeData.codigoAbordaje}
                        />
                    </TabsContent>

                    <TabsContent value="medicamentos">
                        <MedicamentosTab
                            medicamentos={medicamentosEntregados}
                            onRegister={() => setShowRegisterMeds(true)}
                        />
                    </TabsContent>

                    <TabsContent value="detalles">
                        <DetallesTab abordajeData={abordajeData} />
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
                    existingIds={abordajeData.comunidades?.map((c) => c.codigoComunidad) || []}
                />

                <AddTejedorModal
                    open={showAddTejedor}
                    onOpenChange={setShowAddTejedor}
                    abordajeId={abordajeData.codigoAbordaje}
                    existingIds={abordajeData.tejedores?.map((t) => t.cedulaTejedor) || []}
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
