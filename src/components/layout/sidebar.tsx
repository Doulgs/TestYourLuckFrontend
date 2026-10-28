"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/components/layout/nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

export const SIDEBAR_EXPANDED = 248;
export const SIDEBAR_COLLAPSED = 68;

export function Sidebar({
  expanded,
  overlay,
  onToggle,
  onNavigate,
}: {
  expanded: boolean;
  overlay: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const width = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <aside
      style={{ width, flex: `0 0 ${width}px` }}
      className={cn(
        "top-0 left-0 z-50 flex h-screen flex-col gap-5 overflow-hidden border-r border-sidebar-border bg-sidebar p-3 transition-[width] duration-200 ease-in-out",
        overlay ? "fixed" : "sticky",
      )}
    >
      <button type="button" onClick={onToggle} title="Recolher / expandir menu" className="flex h-11 cursor-pointer items-center rounded-[10px]">
        {expanded ? (
          <Image src="/assets/logo-tyl.png" alt="TestYourLuck" width={135} height={40} className="mix-blend-screen" style={{ height: 40, width: "auto" }} priority />
        ) : (
          <Image src="/assets/icon-tyl.png" alt="TestYourLuck" width={44} height={44} className="size-11 object-contain mix-blend-screen" priority />
        )}
      </button>

      {NAV_GROUPS.map((group) => (
        <nav key={group.title} className="flex flex-col gap-1">
          {expanded && <div className="px-2.5 pb-1.5 text-xs whitespace-nowrap text-[#8a8a8a]">{group.title}</div>}
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={onNavigate}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm whitespace-nowrap transition-colors hover:bg-[#1c1c1c]",
                  active ? "bg-[#1f1f1f] text-foreground" : "text-[#d4d4d4]",
                )}
              >
                <Icon className="size-[18px] shrink-0 opacity-90" />
                {expanded && <span className="flex-1">{label}</span>}
              </Link>
            );
          })}
        </nav>
      ))}

      <div className="flex-1" />
      <UserMenu expanded={expanded} />
    </aside>
  );
}
