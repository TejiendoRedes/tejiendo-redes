import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppHeader title={title} subtitle={subtitle} />
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8 overflow-x-hidden">
        {actions && <div className="mb-6 flex flex-wrap items-center gap-3">{actions}</div>}
        {children}
      </main>
    </div>
  );
}
