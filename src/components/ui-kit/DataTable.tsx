import React, { useMemo, useState, type ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export type FilterDef<T> = {
  key: keyof T;
  label: string;
  options: { label: string; value: string }[];
};

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
};

export function DataTable<T extends any>({
  title,
  description,
  columns,
  data,
  searchKeys,
  searchPlaceholder = "Buscar...",
  pageSize = 6,
  primaryAction,
  filters,
}: {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  searchKeys: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  primaryAction?: { label: string; onClick?: () => void };
  filters?: FilterDef<T>[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const filtered = useMemo(() => {
    let result = data;

    // Apply active filters
    if (filters) {
      filters.forEach((f) => {
        const selected = activeFilters[f.key as string];
        if (selected && selected.length > 0) {
          result = result.filter((row) => selected.includes(String(row[f.key] ?? "")));
        }
      });
    }

    // Apply search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
      );
    }

    return result;
  }, [data, query, searchKeys, activeFilters, filters]);

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
    setPage(0);
  };

  const activeFiltersCount = Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:min-w-[18rem]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          {filters && filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#1e3a8a]/30 bg-[#1e3a8a]/5 px-4 text-sm font-medium text-[#1e3a8a] transition-colors hover:bg-[#1e3a8a]/10 cursor-pointer">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-bold text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {filters.map((f, i) => (
                  <React.Fragment key={f.key as string}>
                    {i > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{f.label}</DropdownMenuLabel>
                    {f.options.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={(activeFilters[f.key as string] || []).includes(opt.value)}
                        onCheckedChange={() => toggleFilter(f.key as string, opt.value)}
                        className="cursor-pointer"
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[550px] relative rounded-b-xl">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted/95 backdrop-blur-sm shadow-sm">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40 group"
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle text-foreground", c.className)}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No se encontraron resultados para “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-semibold text-foreground">
            {filtered.length === 0 ? 0 : current * pageSize + 1}–
            {Math.min(filtered.length, (current + 1) * pageSize)}
          </span>{" "}
          de <span className="font-semibold text-foreground">{filtered.length}</span> registros
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "h-9 w-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                i === current
                  ? "bg-[#1e3a8a] text-white"
                  : "border border-input bg-background text-foreground hover:bg-muted",
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={current >= pageCount - 1}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
