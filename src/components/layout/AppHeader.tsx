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
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden cursor-pointer"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar paciente, abordaje..."
          className="h-11 w-64 rounded-xl border border-input bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <button
        aria-label="Notificaciones"
        className="relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-red" />
      </button>

      <button className="flex items-center gap-3 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-2 transition-colors hover:bg-muted cursor-pointer">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground uppercase">
          {user?.nombre ? user.nombre.slice(0, 2) : "U"}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-foreground">
            {user?.nombre || "Usuario"}
          </span>
          <span className="block text-xs leading-tight text-muted-foreground capitalize">{user?.role || "Invitado"}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </button>

      <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
         <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
