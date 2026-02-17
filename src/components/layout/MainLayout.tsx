'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/components/ui/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GlobalEditManager } from '@/components/shared/GlobalEditManager';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDesktop, isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500 font-medium">No se pudo verificar la sesión.</p>
        <Button onClick={() => { router.push('/login'); router.refresh(); }}>
          Ir al Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-16 md:pb-0">

      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile/Tablet Sheet Sidebar (triggered by menu button) */}
      {!isDesktop && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <Sidebar
              collapsed={false}
              onToggle={() => setIsSheetOpen(false)}
              variant="drawer"
              hideToggle
              className="border-none"
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Topbar: passes menu click handler if not desktop (for Tablet) */}
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={!isDesktop ? () => setIsSheetOpen(true) : undefined}
      />

      <main
        className={cn(
          'pt-20 px-4 md:px-6 transition-all duration-300',
          isDesktop ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'
        )}
      >
        <Breadcrumbs />
        <GlobalEditManager />
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav onMenuClick={() => setIsSheetOpen(true)} />}
    </div>
  );
}
