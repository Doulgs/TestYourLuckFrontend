"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PAGE_LABELS, TOTEM_PATHS } from "@/components/layout/nav";
import { SIDEBAR_COLLAPSED, Sidebar } from "@/components/layout/sidebar";
import { MOBILE_BREAKPOINT, useViewportWidth } from "@/hooks/use-viewport";
import { useUiStore } from "@/stores/ui-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const width = useViewportWidth();
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, closeSidebar } = useUiStore();
  const mobile = width < MOBILE_BREAKPOINT;
  const totem = TOTEM_PATHS.includes(pathname);
  const expanded = mobile ? sidebarOpen : !sidebarCollapsed;
  const overlay = mobile && expanded;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {!totem && overlay && <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-black/60" />}
      {!totem && (
        <>
          {overlay && <div style={{ width: SIDEBAR_COLLAPSED, flex: `0 0 ${SIDEBAR_COLLAPSED}px` }} />}
          <Sidebar expanded={expanded} overlay={overlay} onToggle={() => toggleSidebar(mobile)} onNavigate={closeSidebar} />
        </>
      )}
      <main className="m-2 flex min-h-[calc(100vh-16px)] min-w-0 flex-1 flex-col rounded-2xl border border-[#1c1c1c] bg-black">
        {!totem && (
          <header className="flex h-14 items-center gap-3.5 border-b border-[#1a1a1a] px-[18px]">
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="text-muted-foreground">TestYourLuck</span>
              <span className="text-[#5a5a5a]">›</span>
              <span>{PAGE_LABELS[pathname] ?? ""}</span>
            </div>
          </header>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-5 p-5">{children}</div>
      </main>
    </div>
  );
}
