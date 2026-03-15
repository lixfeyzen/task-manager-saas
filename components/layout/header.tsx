"use client";

import React from "react";
import { Search, Command, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenCommandPalette?: () => void;
  onOpenSearch?: () => void;
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function Header({ title, subtitle, onOpenCommandPalette, onOpenSearch, user }: HeaderProps) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-[#1E1E25] bg-[#0B0B0F]/80 backdrop-blur-md sticky top-0 z-40">
      {/* Left: title */}
      <div className="flex items-center gap-3">
        {title && (
          <div>
            <h1 className="text-[#F4F4F5] font-semibold text-base leading-tight">{title}</h1>
            {subtitle && <p className="text-[#52525B] text-xs">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className={cn(
            "flex items-center gap-2 h-8 px-3 rounded-lg text-sm",
            "bg-[#111116] border border-[#1E1E25] text-[#52525B]",
            "hover:border-[#2A2A35] hover:text-[#A1A1AA] transition-all duration-150",
            "w-48"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search tasks…</span>
          <kbd className="text-[10px] font-medium px-1 py-0.5 rounded border border-[#2A2A35] bg-[#16161D] text-[#52525B]">
            ⌘K
          </kbd>
        </button>

        {/* Command palette */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommandPalette}
          className="text-[#52525B] hover:text-[#A1A1AA]"
          title="Command palette (⌘K)"
        >
          <Command className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
