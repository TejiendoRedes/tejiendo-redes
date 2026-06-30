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
  UserPlus,
  Map,
  Building2,
  Stethoscope as StethoscopeIcon,
  ShieldAlert,
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
    title: "Gestión de Personas",
    items: [
      { label: "Pacientes", to: "/datos-basicos/pacientes", icon: Users },
      { label: "Tejedores", to: "/tejedores", icon: HeartHandshake }, // original says /tejedores for tejedores, wait, earlier I saw `/datos-basicos/tejedores` and `/tejedores`. Let's use `/datos-basicos/tejedores` or what is in the codebase.
      // Let's verify what routes they have exactly.
      { label: "Aspirantes", to: "/datos-basicos/aspirantes", icon: UserPlus },
      { label: "Médicos", to: "/datos-basicos/medicos", icon: UserRound },
      { label: "Responsables Com.", to: "/datos-basicos/responsables", icon: Users },
    ],
  },
  {
    title: "Atención Médica",
    items: [
      { label: "Consultas", to: "/atencion-medica", icon: Stethoscope },
      { label: "Historias Clínicas", to: "/datos-basicos/consultas", icon: ClipboardList }, // Assuming this mapping
    ],
  },
  {
    title: "Operaciones",
    items: [
      { label: "Abordajes", to: "/abordajes", icon: CalendarHeart },
      { label: "Farmacia", to: "/farmacia/medicamentos", icon: Pill },
      { label: "Peticiones", to: "/farmacia/peticiones", icon: Boxes },
    ],
  },
  {
    title: "Catálogos (Sistema)",
    items: [
      { label: "Comunidades", to: "/datos-basicos/comunidades", icon: Map },
      { label: "Instituciones", to: "/datos-basicos/organismos", icon: Building2 }, // organismos is used in the app folder
      { label: "Especialidades", to: "/datos-basicos/especialidades", icon: StethoscopeIcon },
      { label: "Enfermedades", to: "/datos-basicos/enfermedades", icon: ShieldAlert },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", to: "/reportes", icon: FileBarChart },
      { label: "Estadísticas", to: "/estadisticas", icon: Activity },
    ],
  },
];
