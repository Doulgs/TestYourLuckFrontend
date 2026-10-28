"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,oklch(0.72_0.2_340),oklch(0.5_0.2_300))] text-[13px] font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export function UserMenu({ expanded }: { expanded: boolean }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left outline-none hover:bg-[#1c1c1c] data-[state=open]:bg-[#1c1c1c]"
        >
          <Avatar initials={user.initials} size={36} />
          {expanded && (
            <>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="size-4 opacity-70" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={14} className="w-[260px] rounded-[14px] border border-input bg-[#141414] p-0 shadow-[0_20px_50px_-10px_#000] ring-0">
        <DropdownMenuLabel className="flex items-center gap-3 p-3 font-normal">
          <Avatar initials={user.initials} size={40} />
          <div className="flex min-w-0 flex-col leading-snug">
            <span className="text-sm font-medium text-foreground">{user.name}</span>
            <span className="truncate text-[13px] text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0 bg-[#262626]" />
        <div className="p-1.5">
          <DropdownMenuItem className="h-10 gap-3 rounded-lg px-3 text-sm">
            <BadgeCheck className="size-[17px] opacity-75" /> Conta
          </DropdownMenuItem>
          <DropdownMenuItem className="h-10 gap-3 rounded-lg px-3 text-sm">
            <Bell className="size-[17px] opacity-75" /> Notificações
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="m-0 bg-[#262626]" />
        <div className="p-1.5">
          <DropdownMenuItem
            className="h-10 gap-3 rounded-lg px-3 text-sm"
            onSelect={() => {
              logout();
              router.replace("/login");
            }}
          >
            <LogOut className="size-[17px] opacity-75" /> Sair
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
