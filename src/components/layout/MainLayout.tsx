'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GlobalEditManager } from '@/components/shared/GlobalEditManager';
import { LayoutProvider } from '@/components/layout/LayoutContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MainWrapper } from '@/components/layout/MainWrapper';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500 font-medium">No se pudo verificar la sesión.</p>
        <Button onClick={() => { router.push('/login'); router.refresh(); }} className="bg-blue-600 hover:bg-blue-700">
          Ir al Login
        </Button>
      </div>
    );
  }

  return (
    <LayoutProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <AppSidebar />
        <MainWrapper>
          <GlobalEditManager />
          {children}
        </MainWrapper>
      </div>
    </LayoutProvider>
  );
}
