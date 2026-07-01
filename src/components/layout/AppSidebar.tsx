'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { navGroups } from "./nav-config";
import { useLayout } from "./LayoutContext";
import { cn } from "@/lib/utils";

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname() || '';

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = item.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useLayout();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[5.25rem]" : "w-72",
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <BrandLogo collapsed={collapsed} />
          {!collapsed && (
            <button
              onClick={toggle}
              aria-label="Colapsar menú"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggle}
            aria-label="Expandir menú"
            className="mx-auto mt-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 overflow-y-auto">
          <NavLinks collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <p className="text-xs text-muted-foreground">
              Aliados de <span className="font-semibold text-foreground">UNICEF</span> y{" "}
              <span className="font-semibold text-foreground">ACNUR</span>
            </p>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-card">
            <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4">
              <BrandLogo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
