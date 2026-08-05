'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageShell } from '@/components/layout/PageShell';
import {
    Users,
    Stethoscope,
    GraduationCap,
    UserCheck,
    MapPin,
    Building2,
    Heart,
    Activity,
    ArrowRight,
} from 'lucide-react';

interface DataCard {
    title: string;
    icon: React.ReactNode;
    path: string;
    description: string;
}

export default function DatosBasicosPage() {
    const router = useRouter();

    const dataCards: DataCard[] = [
        {
            title: 'Aspirantes',
            icon: <Users className="w-6 h-6" />,
            path: '/datos-basicos/aspirantes',
            description: 'Aspirantes a tejedores',
        },
        {
            title: 'Tejedores',
            icon: <Users className="w-6 h-6" />,
            path: '/datos-basicos/tejedores',
            description: 'Voluntarios y colaboradores',
        },
        {
            title: 'Médicos',
            icon: <Stethoscope className="w-6 h-6" />,
            path: '/datos-basicos/medicos',
            description: 'Personal médico registrado',
        },
        {
            title: 'Especialidades',
            icon: <GraduationCap className="w-6 h-6" />,
            path: '/datos-basicos/especialidades',
            description: 'Especialidades médicas',
        },
        {
            title: 'Responsables',
            icon: <UserCheck className="w-6 h-6" />,
            path: '/datos-basicos/responsables',
            description: 'Responsables comunitarios',
        },
        {
            title: 'Comunidades',
            icon: <MapPin className="w-6 h-6" />,
            path: '/datos-basicos/comunidades',
            description: 'Comunidades registradas',
        },
        {
            title: 'Instituciones',
            icon: <Building2 className="w-6 h-6" />,
            path: '/datos-basicos/organismos',
            description: 'Organismos e instituciones',
        },
        {
            title: 'Enfermedades',
            icon: <Activity className="w-6 h-6" />,
            path: '/datos-basicos/enfermedades',
            description: 'Catálogo de enfermedades',
        },
        {
            title: 'Pacientes',
            icon: <Heart className="w-6 h-6" />,
            path: '/datos-basicos/pacientes',
            description: 'Registro de pacientes',
        },
    ];

    return (
        <MainLayout>
            <PageShell
                title="Datos Básicos"
                subtitle="Gestión de catálogos y datos maestros del sistema"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {dataCards.map(card => (
                        <button
                            key={card.path}
                            onClick={() => router.push(card.path)}
                            className="bg-card rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-3.5 mb-4">
                                    <div className="bg-[#1e3a8a]/10 text-[#1e3a8a] p-3 rounded-xl group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors duration-300">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{card.description}</p>
                            </div>
                            <div className="flex items-center text-sm text-[#1e3a8a] font-semibold group-hover:translate-x-1 transition-transform">
                                Ver módulo <ArrowRight className="w-4 h-4 ml-1.5" />
                            </div>
                        </button>
                    ))}
                </div>
            </PageShell>
        </MainLayout>
    );
}
