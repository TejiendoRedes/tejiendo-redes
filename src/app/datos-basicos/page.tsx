'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
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
            title: 'Tejedores',
            icon: <Users className="w-6 h-6" />,
            path: '/datos-basicos/tejedores',
            description: 'Voluntarios y colaboradores',
        },
        {
            title: 'Aspirantes',
            icon: <Users className="w-6 h-6" />,
            path: '/datos-basicos/aspirantes',
            description: 'Aspirantes a tejedores',
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
            title: 'Pacientes',
            icon: <Heart className="w-6 h-6" />,
            path: '/datos-basicos/pacientes',
            description: 'Registro de pacientes',
        },
        {
            title: 'Enfermedades',
            icon: <Activity className="w-6 h-6" />,
            path: '/datos-basicos/enfermedades',
            description: 'Catálogo de enfermedades',
        },
    ];


    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Datos Básicos</h1>
                    <p className="text-muted-foreground">
                        Gestión de catálogos y datos maestros del sistema
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dataCards.map(card => (
                        <button
                            key={card.path}
                            onClick={() => router.push(card.path)}
                            className="bg-card rounded-lg border border-border p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-primary/10 text-primary p-2.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {card.icon}
                                </div>
                                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                            <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
