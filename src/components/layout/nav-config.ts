import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Stethoscope,
  CalendarHeart,
  Pill,
  FileBarChart,
  UserRound,
  ClipboardList,
  Boxes,
  Activity,
  MapPin,
  GraduationCap,
  UserCheck,
  Building2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
  roles?: string[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Dashboards",
    items: [{ label: "Resumen General", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Atención Médica",
    roles: ["admin", "superuser", "medico"],
    items: [
      { label: "Consultas", to: "/atencion-medica", icon: Stethoscope },
      { label: "Historias Clínicas", to: "/datos-basicos/consultas", icon: ClipboardList },
    ],
  },
  {
    title: "Operaciones",
    roles: ["admin", "superuser", "operador"],
    items: [
      { label: "Abordajes", to: "/abordajes", icon: CalendarHeart },
      { label: "Farmacia", to: "/farmacia/peticiones", icon: Pill },
      { label: "Inventario", to: "/farmacia/medicamentos", icon: Boxes },
    ],
  },
  {
    title: "Gestión Principal",
    items: [
      { label: "Pacientes", to: "/datos-basicos/pacientes", icon: Users, roles: ["admin", "superuser", "operador", "medico"] },
      { label: "Tejedores", to: "/datos-basicos/tejedores", icon: HeartHandshake, roles: ["admin", "superuser", "operador"] },
      { label: "Aspirantes", to: "/datos-basicos/aspirantes", icon: UserRound, roles: ["admin", "superuser", "operador"] },
      { label: "Personal Médico", to: "/datos-basicos/medicos", icon: Stethoscope, roles: ["admin", "superuser", "operador"] },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", to: "/reportes", icon: FileBarChart, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
      { label: "Indicadores", to: "/estadisticas", icon: Activity, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
    ],
  },
  {
    title: "Catálogos",
    roles: ["admin", "superuser", "operador"],
    items: [
      { label: "Comunidades", to: "/datos-basicos/comunidades", icon: MapPin },
      { label: "Especialidades", to: "/datos-basicos/especialidades", icon: GraduationCap },
      { label: "Enfermedades", to: "/datos-basicos/enfermedades", icon: Activity },
      { label: "Instituciones", to: "/datos-basicos/organismos", icon: Building2 },
      { label: "Responsables", to: "/datos-basicos/responsables", icon: UserCheck },
    ],
  },
];
