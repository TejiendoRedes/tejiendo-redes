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
    Shield,
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
        roles: ['admin', 'superuser', 'medico', 'operador', 'invitado'],
        children: [
            { label: 'Tejedores', path: '/datos-basicos/tejedores', icon: <Users className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Aspirantes', path: '/datos-basicos/aspirantes', icon: <UserPlus className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador', 'invitado'] },
            { label: 'Médicos', path: '/datos-basicos/medicos', icon: <Stethoscope className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Especialidades', path: '/datos-basicos/especialidades', icon: <GraduationCap className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Responsables Comunitarios', path: '/datos-basicos/responsables', icon: <UserCheck className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Comunidades', path: '/datos-basicos/comunidades', icon: <MapPin className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Instituciones', path: '/datos-basicos/organismos', icon: <Building2 className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Pacientes', path: '/datos-basicos/pacientes', icon: <Heart className="w-4 h-4" />, roles: ['admin', 'superuser', 'medico', 'operador'] },
            { label: 'Enfermedades', path: '/datos-basicos/enfermedades', icon: <Activity className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Antecedentes', path: '/datos-basicos/antecedentes', icon: <FileClock className="w-4 h-4" />, roles: ['admin', 'superuser', 'medico', 'operador'] },
        ],
    },
    {
        label: 'Consultas',
        path: '/atencion-medica',
        icon: <Stethoscope className="w-5 h-5" />,
        roles: ['admin', 'superuser', 'medico'],
    },
    {
        label: 'Abordaje Tejiendo Redes',
        path: '/abordajes',
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ['admin', 'superuser', 'operador'],
        children: [
            { label: 'Solicitudes', path: '/abordajes/solicitudes-abordajes', icon: <Clock className="w-4 h-4" /> },
            { label: 'Abordajes Confirmados', path: '/abordajes', icon: <CheckCircle className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Farmacia',
        path: '/farmacia',
        icon: <Pill className="w-4 h-4" />,
        roles: ['admin', 'superuser', 'operador'],
        children: [
            { label: 'Medicamentos', path: '/farmacia/medicamentos', icon: <Heart className="w-4 h-4" /> },
            { label: 'Entrega de Medicamentos', path: '/farmacia/peticiones', icon: <FileQuestion className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Reportes',
        path: '/reportes',
        icon: <FileText className="w-5 h-5" />,
        roles: ['admin', 'superuser'],
    },
    {
        label: 'Administración',
        path: '/dashboard/admin/gestion',
        icon: <UserCheck className="w-5 h-5" />,
        roles: ['admin', 'superuser'],
    },
    {
        label: 'Seguridad y Logs',
        path: '/dashboard/super-usuario/seguridad',
        icon: <Shield className="w-5 h-5" />,
        roles: ['superuser'],
    },
    {
        label: 'Configuración',
        path: '/settings',
        icon: <Settings className="w-5 h-5" />,
        roles: ['admin', 'superuser'],
    },
];
