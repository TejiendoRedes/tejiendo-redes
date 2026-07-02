'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui-kit/form';
import { Button } from '@/components/ui/button';
import { 
    User, 
    ClipboardList, 
    BookOpen, 
    CalendarHeart,
    Award,
    Clock,
    MapPin,
    HeartPulse,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function TejedorDashboard() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <MainLayout>
            <PageShell
                title="Hola, Tejedor"
                subtitle="Tu espacio personal para gestionar actividades, formación y voluntariado."
            >
                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Tarjeta 1: Abordajes */}
                    <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Mis Abordajes</p>
                                <p className="text-4xl font-bold text-gray-900">8</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                                <CalendarHeart className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-blue-600">
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" /> 2 pendientes este mes
                            </span>
                        </div>
                    </div>

                    {/* Tarjeta 2: Horas */}
                    <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Horas Voluntarias</p>
                                <p className="text-4xl font-bold text-gray-900">120<span className="text-2xl text-gray-400">h</span></p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-emerald-600">
                            <span>Top 10% de tejedores</span>
                        </div>
                    </div>

                    {/* Tarjeta 3: Pacientes */}
                    <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pacientes Atendidos</p>
                                <p className="text-4xl font-bold text-gray-900">45</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-inner">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-violet-600">
                            <span>Impacto directo</span>
                        </div>
                    </div>

                    {/* Tarjeta 4: Reconocimientos */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-blue-700 text-white shadow-md rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Nivel de Tejedor</p>
                                <p className="text-3xl font-bold text-white mt-1">Plata</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm shadow-inner">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <div className="w-full bg-black/20 rounded-full h-1.5 mb-1.5">
                                <div className="bg-white h-1.5 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-xs font-medium text-blue-100">Faltan 30h para nivel Oro</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Perfil y Accesos Rápidos */}
                    <div className="space-y-8">
                        <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 rounded-2xl">
                            <div className="h-24 bg-gradient-to-r from-[#1e3a8a] to-blue-600 relative">
                                <div className="absolute -bottom-10 inset-x-0 flex justify-center">
                                    <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-md rotate-3 transition-transform hover:rotate-0 duration-300">
                                        <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-[#1e3a8a]">
                                            <User className="w-10 h-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-14 pb-6 px-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900">Tejedor Activo</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Especialidad: Trabajo Social</p>
                                
                                <div className="mt-6 flex gap-2">
                                    <Button variant="outline" className="w-full rounded-xl border-gray-200 hover:bg-gray-50 transition-colors">
                                        Ver Perfil
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BookOpen className="w-24 h-24 text-emerald-600 -mr-6 -mt-6 transform rotate-12" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 mb-2 relative z-10">Academia de Tejedores</h3>
                            <p className="text-sm text-emerald-700/80 mb-6 relative z-10 leading-relaxed">
                                Accede a nuevos módulos de formación comunitaria y mejora tus habilidades de liderazgo.
                            </p>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                Ir a la Academia <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Columna Derecha: Próximas Actividades */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Tu agenda próxima</h3>
                            <Button variant="ghost" className="text-[#1e3a8a] font-semibold hover:bg-blue-50">
                                Ver todo el calendario
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Actividad 1 */}
                            <div className="group flex items-stretch bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-blue-100 cursor-pointer">
                                <div className="w-2 bg-[#1e3a8a] transition-all group-hover:w-3"></div>
                                <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-[#1e3a8a] shrink-0">
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Jul</span>
                                            <span className="text-xl font-black leading-none">12</span>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-[#1e3a8a] transition-colors">Jornada de Salud Preventiva</h4>
                                            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" /> 08:00 AM</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" /> C.C. Los Curos</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="rounded-xl shrink-0 sm:self-center">
                                        Ver detalles
                                    </Button>
                                </div>
                            </div>

                            {/* Actividad 2 */}
                            <div className="group flex items-stretch bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-emerald-100 cursor-pointer">
                                <div className="w-2 bg-emerald-500 transition-all group-hover:w-3"></div>
                                <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Jul</span>
                                            <span className="text-xl font-black leading-none">18</span>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Taller: Primeros Auxilios</h4>
                                            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" /> 02:00 PM</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" /> Sede Principal FTR</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="rounded-xl shrink-0 sm:self-center">
                                        Ver detalles
                                    </Button>
                                </div>
                            </div>

                            {/* Actividad 3 */}
                            <div className="group flex items-stretch bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-gray-200 cursor-pointer">
                                <div className="w-2 bg-gray-300 transition-all group-hover:w-3"></div>
                                <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 text-gray-500 shrink-0">
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Jul</span>
                                            <span className="text-xl font-black leading-none">25</span>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 group-hover:text-gray-700 transition-colors">Censo Nutricional Infantil</h4>
                                            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" /> 09:00 AM</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" /> El Campito</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="rounded-xl shrink-0 sm:self-center">
                                        Ver detalles
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageShell>
        </MainLayout>
    );
}
