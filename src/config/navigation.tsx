/**
 * @module config/navigation
 * @description Configuración del menú de navegación del sidebar.
 *
 * Define la estructura jerárquica del menú con control de acceso por roles.
 * Los items con `roles` definido solo se muestran a usuarios con esos roles.
 * Los items sin `roles` son visibles para todos los usuarios autenticados.
 *
 * @see {@link file://src/components/layout/Sidebar.tsx} - Componente que renderiza este menú.
 */

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
            { label: 'Aspirantes', path: '/datos-basicos/aspirantes', icon: <UserPlus className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador', 'invitado'] },
            { label: 'Tejedores', path: '/datos-basicos/tejedores', icon: <Users className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Médicos', path: '/datos-basicos/medicos', icon: <Stethoscope className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Especialidades', path: '/datos-basicos/especialidades', icon: <GraduationCap className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Responsables Comunitarios', path: '/datos-basicos/responsables', icon: <UserCheck className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Comunidades', path: '/datos-basicos/comunidades', icon: <MapPin className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Instituciones', path: '/datos-basicos/organismos', icon: <Building2 className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
            { label: 'Enfermedades', path: '/datos-basicos/enfermedades', icon: <Activity className="w-4 h-4" />, roles: ['admin', 'superuser', 'operador'] },
        ],
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
        label: 'Consultas',
        path: '/atencion-medica',
        icon: <Stethoscope className="w-5 h-5" />,
        roles: ['admin', 'superuser', 'medico'],
    },
    {
        label: 'Farmacia',
        path: '/farmacia',
        icon: <Pill className="w-4 h-4" />,
        roles: ['admin', 'superuser', 'operador'],
        children: [
            { label: 'Dashboard', path: '/farmacia/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
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

];
