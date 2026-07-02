"use client";

import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLayout } from "./LayoutContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GlobalSearch } from "@/components/shared/GlobalSearch";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setMobileOpen } = useLayout();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[1.35rem] font-extrabold tracking-tight text-[#1e293b]">{title}</h1>
          {subtitle && <p className="truncate text-[0.9rem] font-medium text-[#64748b]">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearch />

        {/* Oculto temporalmente: Campana de Notificaciones (Mockup) */}
        {/*
        <DropdownMenu>
          ...
        </DropdownMenu>
        */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-gray-50 cursor-pointer shadow-sm outline-none">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white uppercase">
                {user?.nombreTejedor ? user.nombreTejedor.slice(0, 2) : "U"}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-bold leading-tight text-[#1e293b]">
                  {user?.nombreTejedor || "Usuario"} {user?.apellidoTejedor || ""}
                </span>
                <span className="block text-xs font-medium leading-tight text-[#64748b] capitalize">{(user as any)?.role || user?.tipodeVoluntario || "Invitado"}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <DropdownMenuLabel className="font-normal px-2 py-2.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-gray-900">{user?.nombreTejedor || "Usuario"} {user?.apellidoTejedor || ""}</p>
                <p className="text-xs leading-none text-gray-500 mt-1">{user?.cedulaTejedor || "ID no disponible"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Oculto temporalmente: Opciones de Perfil (Mockup) */}
            {/*
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5" onClick={() => router.push('/dashboard/admin')}>
              <User className="mr-2 h-4 w-4" />
              <span className="font-medium">Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5">
              <Settings className="mr-2 h-4 w-4" />
              <span className="font-medium">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            */}
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-bold">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
