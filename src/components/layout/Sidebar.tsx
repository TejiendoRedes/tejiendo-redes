import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  FileClock,
  ClipboardList,
  FileQuestion,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/components/ui/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Inicio',
    path: '/dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: 'Datos Básicos',
    path: '/datos-basicos',
    icon: <Database className="w-5 h-5" />,
    // roles: ['ADMIN', 'REGISTRO'],
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
    label: 'Abordajes',
    path: '/abordajes',
    icon: <ClipboardList className="w-5 h-5" />,
    children: [
      { label: 'Solicitudes', path: '/abordajes/solicitudes-abordajes', icon: <Clock className="w-4 h-4" /> },
      { label: 'Abordajes Confirmados', path: '/abordajes', icon: <CheckCircle className="w-4 h-4" /> },
    ],
    // roles: ['ADMIN', 'REGISTRO', 'MEDICO'],
  },
  {
    label: 'Farmacia',
    path: '/farmacia',
    icon: <Pill className="w-4 h-4" />,
    children: [
      { label: 'Medicamentos', path: '/farmacia/medicamentos', icon: <Heart className="w-4 h-4" /> },
      { label: 'Peticiones', path: '/farmacia/peticiones', icon: <FileQuestion className="w-4 h-4" /> },
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
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const shouldShowItem = (item: MenuItem) => {
    return true;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo y Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Image
              src="/minilogo.png"
              alt="Logo"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="font-bold text-lg text-gray-900">Abordajes</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Image
              src="/minilogo.png"
              alt="Logo"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map(item => {
            if (!shouldShowItem(item)) return null;

            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.path);
            const itemActive = isActive(item.path);

            return (
              <li key={item.path}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        itemActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              'w-4 h-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children?.map(child => (
                          <li key={child.path}>
                            <Link
                              href={child.path}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive(child.path)
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-600 hover:bg-gray-100'
                              )}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      itemActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </aside>
  );
}

