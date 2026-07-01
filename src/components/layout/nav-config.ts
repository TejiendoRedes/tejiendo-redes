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
    items: [{ label: "Resumen General", to: "/dashboard/admin", icon: LayoutDashboard }],
  },
  {
    title: "Datos Básicos",
    items: [
      { label: "Pacientes", to: "/datos-basicos/pacientes", icon: Users },
      { label: "Tejedores", to: "/datos-basicos/tejedores", icon: HeartHandshake },
      { label: "Personal de Salud", to: "/datos-basicos/medicos", icon: UserRound },
    ],
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
    title: "Análisis",
    items: [
      { label: "Reportes", to: "/reportes", icon: FileBarChart },
      { label: "Indicadores", to: "/estadisticas", icon: Activity },
    ],
  },
];
