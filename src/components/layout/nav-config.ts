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
    roles: ["admin", "superuser", "medico", "tejedor"],
    items: [
      { label: "Consultas", to: "/atencion-medica", icon: Stethoscope, roles: ["admin", "superuser", "medico", "tejedor"] },
      { label: "Historias Clínicas", to: "/datos-basicos/consultas", icon: ClipboardList, roles: ["admin", "superuser", "medico", "tejedor"] },
    ],
  },
  {
    title: "Operaciones",
    roles: ["admin", "superuser", "operador", "medico", "tejedor"],
    items: [
      { label: "Abordajes", to: "/abordajes", icon: CalendarHeart, roles: ["admin", "superuser", "operador", "tejedor"] },
      { label: "Farmacia", to: "/farmacia/entregas", icon: Pill, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
      { label: "Inventario", to: "/farmacia/medicamentos", icon: Boxes, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
    ],
  },
  {
    title: "Gestión Principal",
    roles: ["admin", "superuser", "operador", "medico", "tejedor"],
    items: [
      { label: "Pacientes", to: "/datos-basicos/pacientes", icon: Users, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
      { label: "Tejedores", to: "/datos-basicos/tejedores", icon: HeartHandshake, roles: ["admin", "superuser", "operador"] },
      { label: "Aspirantes", to: "/datos-basicos/aspirantes", icon: UserRound, roles: ["admin", "superuser", "operador"] },
      { label: "Personal Médico", to: "/datos-basicos/medicos", icon: Stethoscope, roles: ["admin", "superuser", "operador"] },
    ],
  },
  {
    title: "Análisis",
    roles: ["admin", "superuser", "operador", "medico", "tejedor"],
    items: [
      { label: "Reportes", to: "/reportes", icon: FileBarChart, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
      { label: "Indicadores", to: "/estadisticas", icon: Activity, roles: ["admin", "superuser", "operador", "medico", "tejedor"] },
    ],
  },
  {
    title: "Catálogos",
    roles: ["admin", "superuser", "operador", "medico"],
    items: [
      { label: "Comunidades", to: "/datos-basicos/comunidades", icon: MapPin, roles: ["admin", "superuser", "operador"] },
      { label: "Especialidades", to: "/datos-basicos/especialidades", icon: GraduationCap, roles: ["admin", "superuser", "operador"] },
      { label: "Enfermedades", to: "/datos-basicos/enfermedades", icon: Activity, roles: ["admin", "superuser", "operador", "medico"] },
      { label: "Instituciones", to: "/datos-basicos/organismos", icon: Building2, roles: ["admin", "superuser", "operador"] },
      { label: "Responsables", to: "/datos-basicos/responsables", icon: UserCheck, roles: ["admin", "superuser", "operador"] },
    ],
  },
];
