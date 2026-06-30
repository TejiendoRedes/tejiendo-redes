"use client";

import { Menu, Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useLayout } from "./LayoutContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setMobileOpen } = useLayout();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Buscar paciente, abordaje..."
          className="h-11 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <button
        aria-label="Notificaciones"
        className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:text-slate-900"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white uppercase">
              {user?.nombreTejedor?.charAt(0) || "U"}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-900">
                {user ? `${user.nombreTejedor} ${user.apellidoTejedor}` : "Usuario"}
              </span>
              <span className="block text-xs leading-tight text-slate-500 capitalize">
                {user?.rol || "Invitado"}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
