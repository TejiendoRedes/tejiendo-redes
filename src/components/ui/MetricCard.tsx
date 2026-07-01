import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "blue" | "sky" | "yellow" | "red" | "success";

const toneMap: Record<Tone, string> = {
  blue: "bg-primary/10 text-primary",
  sky: "bg-brand-sky/15 text-brand-sky",
  yellow: "bg-brand-yellow/20 text-warning-foreground",
  red: "bg-brand-red/10 text-brand-red",
  success: "bg-success/10 text-success",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  delta?: number;
  hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", toneMap[tone])}>
          <Icon className="h-6 w-6" />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              positive ? "bg-success/10 text-success" : "bg-brand-red/10 text-brand-red",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
