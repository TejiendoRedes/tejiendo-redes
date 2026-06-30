"use client";

import { useLayout } from "./LayoutContext";
import { cn } from "@/lib/utils";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useLayout();
  
  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-[padding] duration-200",
        collapsed ? "lg:pl-[5.25rem]" : "lg:pl-72"
      )}
    >
      {children}
    </div>
  );
}
