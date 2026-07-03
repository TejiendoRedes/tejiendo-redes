import React from 'react';
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
    Sparkles,
    CalendarX,
    Stethoscope,
    Pill
} from 'lucide-react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { tejedores } from '@/db/schema/tejedores';
import { tejedoresAbordaje } from '@/db/schema/relations';
import { abordaje } from '@/db/schema/abordajes';
import { abordajeAsistencia } from '@/db/schema/abordaje-asistencia';
import { eq, sql, and, gte } from 'drizzle-orm';

// Convertido a Server Component
export default async function TejedorDashboard() {
    // 1. Autenticación segura
    const session = await requireAuth();
    const cedula = session.cedulaTejedor;

    // 2. Obtener perfil
    const [perfil] = await db.select().from(tejedores).where(eq(tejedores.cedulaTejedor, cedula)).limit(1);

    // 3. Mis Abordajes (count)
    const misAbordajesResult = await db.select({ count: sql<number>`count(*)` })
        .from(tejedoresAbordaje)
        .where(eq(tejedoresAbordaje.cedulaTejedor, cedula));
    const totalAbordajes = misAbordajesResult[0]?.count || 0;

    // 4. Horas Voluntarias (SUM(diff in hours))
    const horasResult = await db.select({ 
        totalHours: sql<number>`SUM(TIMESTAMPDIFF(HOUR, ${abordaje.horaInicio}, ${abordaje.horaFin}))`
    })
        .from(tejedoresAbordaje)
        .innerJoin(abordaje, eq(tejedoresAbordaje.codigoAbordaje, abordaje.codigoAbordaje))
        .where(eq(tejedoresAbordaje.cedulaTejedor, cedula));
    const totalHoras = horasResult[0]?.totalHours || 0;

    // 5. Pacientes Atendidos (impacto en los abordajes donde participó)
    const pacientesResult = await db.select({ count: sql<number>`count(*)` })
        .from(abordajeAsistencia)
        .innerJoin(tejedoresAbordaje, eq(abordajeAsistencia.codigoAbordaje, tejedoresAbordaje.codigoAbordaje))
        .where(eq(tejedoresAbordaje.cedulaTejedor, cedula));
    const totalPacientes = pacientesResult[0]?.count || 0;



    // Lógica de Niveles basada en horas
    let nivel = 'Bronce';
    let nextNivel = 'Plata';
    let horasFaltantes = 30 - totalHoras;
    let progresoPorcentaje = (totalHoras / 30) * 100;

    if (totalHoras >= 100) {
        nivel = 'Oro';
        nextNivel = 'Diamante';
        horasFaltantes = 300 - totalHoras;
        progresoPorcentaje = (totalHoras / 300) * 100;
    } else if (totalHoras >= 30) {
        nivel = 'Plata';
        nextNivel = 'Oro';
        horasFaltantes = 100 - totalHoras;
        progresoPorcentaje = (totalHoras / 100) * 100;
    }

    if (progresoPorcentaje > 100) progresoPorcentaje = 100;

    // Colores por nivel
    const levelColors: Record<string, string> = {
        'Bronce': 'from-[#cd7f32] to-[#a05a2c]',
        'Plata': 'from-gray-400 to-gray-600',
        'Oro': 'from-yellow-400 to-yellow-600',
        'Diamante': 'from-cyan-400 to-blue-600'
    };

    const gradientClass = levelColors[nivel] || 'from-[#1e3a8a] to-blue-700';


    return (
        <MainLayout>
            <PageShell
                title={`Hola, ${perfil?.nombreTejedor || session.nombreTejedor}`}
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
                                <p className="text-4xl font-bold text-gray-900">{totalAbordajes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                                <CalendarHeart className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-blue-600">
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" /> Activo en tu comunidad
                            </span>
                        </div>
                    </div>

                    {/* Tarjeta 2: Horas */}
                    <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Horas Voluntarias</p>
                                <p className="text-4xl font-bold text-gray-900">{totalHoras}<span className="text-2xl text-gray-400">h</span></p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-emerald-600">
                            <span>Suma de servicio comunitario</span>
                        </div>
                    </div>

                    {/* Tarjeta 3: Pacientes */}
                    <div className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pacientes Atendidos</p>
                                <p className="text-4xl font-bold text-gray-900">{totalPacientes}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-inner">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4 flex items-center text-sm font-medium text-violet-600">
                            <span>Impacto directo global</span>
                        </div>
                    </div>

                    {/* Tarjeta 4: Reconocimientos */}
                    <div className={`group relative overflow-hidden bg-gradient-to-br ${gradientClass} text-white shadow-md rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wider text-white/80">Nivel de Tejedor</p>
                                <p className="text-3xl font-bold text-white mt-1">{nivel}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm shadow-inner">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <div className="w-full bg-black/20 rounded-full h-1.5 mb-1.5">
                                <div className="bg-white h-1.5 rounded-full" style={{ width: `${progresoPorcentaje}%` }}></div>
                            </div>
                            {nivel !== 'Diamante' ? (
                                <p className="text-xs font-medium text-white/90">Faltan {horasFaltantes}h para nivel {nextNivel}</p>
                            ) : (
                                <p className="text-xs font-medium text-white/90">¡Nivel Máximo Alcanzado!</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Perfil */}
                    <Card className="flex flex-col h-full overflow-hidden border-0 shadow-lg ring-1 ring-black/5 rounded-2xl">
                        <div className="h-24 shrink-0 bg-gradient-to-r from-[#1e3a8a] to-blue-600 relative">
                            <div className="absolute -bottom-10 inset-x-0 flex justify-center">
                                <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-md transition-transform hover:scale-105 duration-300">
                                    <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a8a]">
                                        <User className="w-10 h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-12 pb-5 px-6 flex-1 flex flex-col">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{perfil?.nombreTejedor} {perfil?.apellidoTejedor}</h3>
                                <p className="text-blue-600 font-semibold text-sm mt-0.5">{perfil?.tipodeVoluntario || 'Voluntario Activo'}</p>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center space-y-2.5">
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Especialidad</p>
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{perfil?.profesionTejedor}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <CalendarHeart className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Miembro desde</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {perfil?.fechaIngreso ? new Date(perfil.fechaIngreso).toLocaleDateString('es-VE', { year: 'numeric', month: 'short' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Ubicación</p>
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{perfil?.municipioTejedor}, {perfil?.estadoTejedor}</p>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </Card>

                    {/* Columna Derecha: Accesos Rápidos */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Herramientas Operativas</h3>
                            <p className="text-sm text-gray-500">Módulos de trabajo rápido</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Censo y Pacientes (Todos) */}
                            {['admin', 'superuser', 'operador', 'medico', 'tejedor'].includes(session.role) && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <ClipboardList className="w-24 h-24 text-blue-600 -mr-6 -mt-6 transform rotate-12" />
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-900 mb-2 relative z-10">Censo y Pacientes</h3>
                                    <p className="text-sm text-blue-700/80 mb-6 relative z-10 leading-relaxed line-clamp-2">
                                        Accede al registro principal para inscribir o consultar pacientes en la comunidad.
                                    </p>
                                    <Link href="/datos-basicos/pacientes">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                            Ir a Pacientes <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Consultas Médicas */}
                            {['admin', 'superuser', 'medico', 'tejedor'].includes(session.role) && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Stethoscope className="w-24 h-24 text-emerald-600 -mr-6 -mt-6 transform rotate-12" />
                                    </div>
                                    <h3 className="text-lg font-bold text-emerald-900 mb-2 relative z-10">Consultas Médicas</h3>
                                    <p className="text-sm text-emerald-700/80 mb-6 relative z-10 leading-relaxed line-clamp-2">
                                        Módulo de triaje, morbilidad y evaluación médica.
                                    </p>
                                    <Link href="/atencion-medica">
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                            Ir a Consultas <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Despacho de Farmacia */}
                            {['admin', 'superuser', 'operador', 'medico', 'tejedor'].includes(session.role) && (
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100/50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Pill className="w-24 h-24 text-orange-600 -mr-6 -mt-6 transform rotate-12" />
                                    </div>
                                    <h3 className="text-lg font-bold text-orange-900 mb-2 relative z-10">Farmacia</h3>
                                    <p className="text-sm text-orange-700/80 mb-6 relative z-10 leading-relaxed line-clamp-2">
                                        Gestiona la entrega de medicamentos para los pacientes.
                                    </p>
                                    <Link href="/farmacia/peticiones">
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                            Ir a Farmacia <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Mis Abordajes (Operadores y Tejedores) */}
                            {['admin', 'superuser', 'operador', 'tejedor'].includes(session.role) && (
                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100/50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CalendarHeart className="w-24 h-24 text-violet-600 -mr-6 -mt-6 transform rotate-12" />
                                    </div>
                                    <h3 className="text-lg font-bold text-violet-900 mb-2 relative z-10">Abordajes</h3>
                                    <p className="text-sm text-violet-700/80 mb-6 relative z-10 leading-relaxed line-clamp-2">
                                        Gestiona o revisa las jornadas y actividades comunitarias.
                                    </p>
                                    <Link href="/abordajes">
                                        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                            Ver Historial <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Enfermedades (Solo Medico si no ve Abordajes) */}
                            {['medico'].includes(session.role) && (
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100/50 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <HeartPulse className="w-24 h-24 text-red-600 -mr-6 -mt-6 transform rotate-12" />
                                    </div>
                                    <h3 className="text-lg font-bold text-red-900 mb-2 relative z-10">Enfermedades</h3>
                                    <p className="text-sm text-red-700/80 mb-6 relative z-10 leading-relaxed line-clamp-2">
                                        Catálogo de patologías y morbilidades del sistema.
                                    </p>
                                    <Link href="/datos-basicos/enfermedades">
                                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all group-hover:shadow-md relative z-10">
                                            Gestionar <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageShell>
        </MainLayout>
    );
}
