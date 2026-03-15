"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, CreditCard } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-0.5 hover:bg-[#F0EDFF] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40">
          <Avatar className="h-7 w-7 ring-1 ring-[#E4E0F5]">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback className="text-[11px] bg-[#EDE9FE] text-[#7C3AED]">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2.5 py-0.5">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-[#E4E0F5]">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="text-[11px] bg-[#EDE9FE] text-[#7C3AED]">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-px min-w-0">
              <span className="text-[#1E1B4B] font-semibold text-[13px] truncate">
                {user?.name ?? "User"}
              </span>
              <span className="text-[#9CA3AF] text-[10px] font-normal truncate">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <User className="h-3.5 w-3.5" />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="h-3.5 w-3.5" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
