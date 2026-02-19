import React from 'react';
import {
    Home,
    Database,
    Activity,
    FileText,
    BarChart3,
    Settings,
    Users,
    Stethoscope,
    GraduationCap,
    UserCheck,
    MapPin,
    Building2,
    Heart,
    FileHeart,
    Pill,
    Calendar,
    Clock,
    CheckCircle,
    FileClock,
    ClipboardList,
    FileQuestion,
    UserPlus,
} from 'lucide-react';

export interface MenuItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
    children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    {
        label: 'Inicio',
        path: '/dashboard',
        icon: <Home className="w-5 h-5" />,
    },
    {
        label: 'Datos Básicos',
        path: '/datos-basicos',
        icon: <Database className="w-5 h-5" />,
        children: [
            { label: 'Tejedores', path: '/datos-basicos/tejedores', icon: <Users className="w-4 h-4" /> },
            { label: 'Aspirantes', path: '/datos-basicos/aspirantes', icon: <UserPlus className="w-4 h-4" /> },
            { label: 'Médicos', path: '/datos-basicos/medicos', icon: <Stethoscope className="w-4 h-4" /> },
            { label: 'Especialidades', path: '/datos-basicos/especialidades', icon: <GraduationCap className="w-4 h-4" /> },
            { label: 'Responsables Comunitarios', path: '/datos-basicos/responsables', icon: <UserCheck className="w-4 h-4" /> },
            { label: 'Comunidades', path: '/datos-basicos/comunidades', icon: <MapPin className="w-4 h-4" /> },
            { label: 'Instituciones', path: '/datos-basicos/organismos', icon: <Building2 className="w-4 h-4" /> },
            { label: 'Pacientes', path: '/datos-basicos/pacientes', icon: <Heart className="w-4 h-4" /> },
            { label: 'Enfermedades', path: '/datos-basicos/enfermedades', icon: <Activity className="w-4 h-4" /> },
            { label: 'Antecedentes', path: '/datos-basicos/antecedentes', icon: <FileClock className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Atención Médica',
        path: '/atencion-medica',
        icon: <Stethoscope className="w-5 h-5" />,
    },
    {
        label: 'Abordaje Tejiendo Redes',
        path: '/abordajes',
        icon: <ClipboardList className="w-5 h-5" />,
        children: [
            { label: 'Solicitudes', path: '/abordajes/solicitudes-abordajes', icon: <Clock className="w-4 h-4" /> },
            { label: 'Abordajes Confirmados', path: '/abordajes', icon: <CheckCircle className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Farmacia',
        path: '/farmacia',
        icon: <Pill className="w-4 h-4" />,
        children: [
            { label: 'Medicamentos', path: '/farmacia/medicamentos', icon: <Heart className="w-4 h-4" /> },
            { label: 'Entrega de Medicamentos', path: '/farmacia/peticiones', icon: <FileQuestion className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Reportes',
        path: '/reportes',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        label: 'Estadísticas',
        path: '/estadisticas',
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        label: 'Mantenimiento',
        path: '/mantenimiento',
        icon: <Settings className="w-5 h-5" />,
    },
];
