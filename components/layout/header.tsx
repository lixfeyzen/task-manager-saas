"use client";

import React from "react";
import { Search } from "lucide-react";
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
    <header className="h-13 shrink-0 flex items-center justify-between px-5 border-b border-[#E4E0F5] bg-white/90 backdrop-blur-md sticky top-0 z-40">
      {/* Left: title */}
      <div className="flex items-center gap-3 min-w-0">
        {title && (
          <div className="min-w-0">
            <h1 className="text-[#1E1B4B] font-semibold text-[15px] leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-[#9CA3AF] text-[11px] leading-none mt-0.5">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: search + user */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search / command palette trigger */}
        <button
          onClick={onOpenSearch ?? onOpenCommandPalette}
          className={cn(
            "flex items-center gap-2 h-8 px-3 rounded-lg",
            "bg-[#F8F7FF] border border-[#E4E0F5] text-[#9CA3AF]",
            "hover:border-[#C9C2EC] hover:text-[#6B7280] hover:bg-[#F0EDFF]",
            "transition-all duration-150 w-52"
          )}
        >
          <Search className="h-3 w-3 shrink-0" />
          <span className="flex-1 text-left text-[11px]">Search…</span>
          <kbd className="flex items-center gap-0.5 text-[9px] font-mono border border-[#E4E0F5] bg-[#F0EDFF] text-[#9CA3AF] rounded px-1 py-0.5">
            ⌘K
          </kbd>
        </button>

        <div className="w-px h-4 bg-[#E4E0F5]" />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
