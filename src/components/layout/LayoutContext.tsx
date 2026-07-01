'use client';

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarState | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Ctx.Provider
      value={{
        collapsed,
        toggle: () => setCollapsed((c) => !c),
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
