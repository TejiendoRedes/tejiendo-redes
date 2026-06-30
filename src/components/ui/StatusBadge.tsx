import React from "react";

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "blue";
  children: React.ReactNode;
}) {
  const colors = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[tone]}`}>
      {children}
    </span>
  );
}
