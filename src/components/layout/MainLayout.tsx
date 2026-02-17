'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/components/ui/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GlobalEditManager } from '@/components/shared/GlobalEditManager';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

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
    // If not loading and no user, but we are here, it means AuthContext doesn't have the user.
    // Middleware might have allowed us (cookie exists), but client-side fetch failed or hasn't updated.
    // To avoid infinite loop (redirecting to login, which redirects back here), show a message or manual retry.
    // Or we can rely on proper sync. 
    // IF we are in a loop, it's better to show a button.
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
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Topbar sidebarCollapsed={sidebarCollapsed} />

      <main
        className={cn(
          'pt-20 pb-8 px-6 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Breadcrumbs />
        <GlobalEditManager />
        {children}
      </main>
    </div>
  );
}
