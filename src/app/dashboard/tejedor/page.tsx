import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ClipboardList, BookOpen, MessageCircle } from 'lucide-react';

export default function TejedorDashboard() {
    return (
        <MainLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Hola, Tejedor</h1>
                    <p className="text-muted-foreground mt-1">
                        Tu espacio para gestionar actividades y formación comunitaria.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Mis Abordajes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">8</div>
                            <p className="text-xs text-muted-foreground">Participaciones</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Horas Voluntarias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-success">120h</div>
                            <p className="text-xs text-muted-foreground">Acumuladas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Mi Perfil</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                                <User className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-bold">Tejedor Activo</h3>
                                <p className="text-xs text-muted-foreground">Especialidad: Medicina Comunitaria</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">Editar Perfil</Button>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Próximas Actividades</CardTitle>
                            <CardDescription>Jornadas y capacitaciones asignadas</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-32 flex flex-col gap-3">
                                <ClipboardList className="w-8 h-8 text-primary" />
                                <span>Ver Asignaciones</span>
                            </Button>
                            <Button variant="outline" className="h-32 flex flex-col gap-3">
                                <BookOpen className="w-8 h-8 text-success" />
                                <span>Material Formativo</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
