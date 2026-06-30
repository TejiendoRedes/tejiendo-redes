"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { navGroups } from "./nav-config";
import { useLayout } from "./LayoutContext";
import { cn } from "@/lib/utils";

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.title}>
          {!collapsed && (
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </p>
          )}
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
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
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500",
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
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[5.25rem]" : "w-72",
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center border-b border-slate-200 px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <BrandLogo collapsed={collapsed} />
          {!collapsed && (
            <button
              onClick={toggle}
              aria-label="Colapsar menú"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggle}
            aria-label="Expandir menú"
            className="mx-auto mt-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 overflow-y-auto">
          <NavLinks collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="border-t border-slate-200 p-4">
            <p className="text-xs text-slate-500">
              Aliados de <span className="font-semibold text-slate-900">UNICEF</span> y{" "}
              <span className="font-semibold text-slate-900">ACNUR</span>
            </p>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">
              <BrandLogo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
