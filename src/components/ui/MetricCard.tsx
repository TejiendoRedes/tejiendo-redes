import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "blue" | "sky" | "success" | "yellow";
  delta?: number;
  hint?: string;
}) {
  const isPositive = delta && delta > 0;
  
  return (
    <Card className="rounded-2xl shadow-sm border-slate-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {label}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-slate-50`}>
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1 flex flex-col gap-1">
           {delta !== undefined && (
             <span className={isPositive ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
               {isPositive ? "+" : ""}{delta}%
             </span>
           )}
           {hint && <span>{hint}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
