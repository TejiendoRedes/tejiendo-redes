import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({ tone, children }: { tone: "success" | "warning" | "red" | "blue" | "muted"; children: ReactNode }) {
  const map = {
    success: "bg-success/10 text-success",
    warning: "bg-brand-yellow/20 text-warning-foreground",
    red: "bg-brand-red/10 text-brand-red",
    blue: "bg-primary/10 text-primary",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", map[tone])}>
      {children}
    </span>
  );
}
