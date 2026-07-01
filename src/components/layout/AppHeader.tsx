"use client";

import { Menu, Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useLayout } from "./LayoutContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setMobileOpen } = useLayout();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
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
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar paciente, abordaje..."
            className="h-10 w-[280px] rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          aria-label="Notificaciones"
          className="relative rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-gray-50 cursor-pointer shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white uppercase">
            {user?.nombre ? user.nombre.slice(0, 2) : "U"}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-bold leading-tight text-[#1e293b]">
              {user?.nombre || "Usuario"} {user?.apellido || ""}
            </span>
            <span className="block text-xs font-medium leading-tight text-[#64748b] capitalize">{user?.role || user?.tipodeVoluntario || "Invitado"}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block ml-1" />
        </button>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50">
           <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
