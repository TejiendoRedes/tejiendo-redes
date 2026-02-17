'use client';

import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuClick?: () => void;
}

export function Topbar({ sidebarCollapsed, onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // En producción, implementar búsqueda global
    console.log('Buscando:', searchQuery);
  };

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-card border-b border-border z-30 transition-all duration-300"
      style={{ left: isDesktop ? (sidebarCollapsed ? '4rem' : '16rem') : '0' }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2" aria-label="Abrir menú de navegación">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {/* Búsqueda Global */}
          <GlobalSearch />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">

          {/* Perfil Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user?.nombreTejedor?.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm">
                    {user?.nombreTejedor} {user?.apellidoTejedor}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.profesionTejedor}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

