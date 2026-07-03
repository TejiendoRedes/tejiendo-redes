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
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Dashboards",
    items: [{ label: "Resumen General", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Atención Médica",
    items: [
      { label: "Consultas", to: "/atencion-medica", icon: Stethoscope },
      { label: "Historias Clínicas", to: "/datos-basicos/consultas", icon: ClipboardList },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { label: "Abordajes", to: "/abordajes", icon: CalendarHeart },
      { label: "Farmacia", to: "/farmacia/peticiones", icon: Pill },
      { label: "Inventario", to: "/farmacia/medicamentos", icon: Boxes },
    ],
  },
  {
    title: "Gestión Principal",
    items: [
      { label: "Pacientes", to: "/datos-basicos/pacientes", icon: Users },
      { label: "Tejedores", to: "/datos-basicos/tejedores", icon: HeartHandshake },
      { label: "Aspirantes", to: "/datos-basicos/aspirantes", icon: UserRound },
      { label: "Personal Médico", to: "/datos-basicos/medicos", icon: Stethoscope },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", to: "/reportes", icon: FileBarChart },
      { label: "Indicadores", to: "/estadisticas", icon: Activity },
    ],
  },
  {
    title: "Catálogos",
    items: [
      { label: "Comunidades", to: "/datos-basicos/comunidades", icon: MapPin },
      { label: "Especialidades", to: "/datos-basicos/especialidades", icon: GraduationCap },
      { label: "Enfermedades", to: "/datos-basicos/enfermedades", icon: Activity },
      { label: "Instituciones", to: "/datos-basicos/organismos", icon: Building2 },
      { label: "Responsables", to: "/datos-basicos/responsables", icon: UserCheck },
    ],
  },
];
