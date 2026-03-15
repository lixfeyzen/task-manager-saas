"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare, CalendarDays, Star,
  Plus, Settings, ChevronDown, ChevronRight,
  Tag, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedView } from "@/app/generated/prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const mainNav: NavItem[] = [
  { href: "/tasks",    label: "My Tasks",  icon: <CheckSquare className="h-[15px] w-[15px]" /> },
  { href: "/today",    label: "Today",     icon: <Star className="h-[15px] w-[15px]" /> },
  { href: "/upcoming", label: "Upcoming",  icon: <CalendarDays className="h-[15px] w-[15px]" /> },
];

interface SidebarProps {
  savedViews?: SavedView[];
  taskCounts?: { today?: number; tasks?: number };
}

export function Sidebar({ savedViews = [], taskCounts = {} }: SidebarProps) {
  const pathname = usePathname();
  const [viewsOpen, setViewsOpen] = useState(true);

  return (
    <aside className="w-56 h-full flex flex-col bg-[#F0EDFF] border-r border-[#E4E0F5] shrink-0">
      {/* Workspace header */}
      <div className="h-14 flex items-center px-3.5 border-b border-[#E4E0F5]">
        <div className="flex items-center gap-2.5 w-full">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]",
            "shadow-[0_2px_12px_rgba(124,58,237,0.35)]"
          )}>
            <CheckSquare className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1E1B4B] tracking-tight leading-none">TaskFlow</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none">Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-2 space-y-px">
        {mainNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const count = item.href === "/today" ? taskCounts.today : item.href === "/tasks" ? taskCounts.tasks : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 group",
                isActive
                  ? "bg-white text-[#1E1B4B] shadow-sm shadow-[#7C3AED]/10"
                  : "text-[#6B7280] hover:bg-white/60 hover:text-[#1E1B4B]"
              )}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#7C3AED] rounded-full" />
              )}
              <span className={cn(
                "shrink-0 transition-colors duration-150",
                isActive ? "text-[#7C3AED]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-[#7C3AED]/15 text-[#7C3AED]"
                    : "bg-[#E4E0F5] text-[#9CA3AF] group-hover:bg-[#D8D3F0]"
                )}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 mx-1 h-px bg-[#E4E0F5]" />

        {/* Saved Views section */}
        <div>
          <button
            onClick={() => setViewsOpen(!viewsOpen)}
            className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 group rounded-md"
          >
            <span className="transition-transform duration-150" style={{ transform: viewsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>
              <ChevronDown className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest">Views</span>
            <Plus className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          </button>

          {viewsOpen && (
            <div className="mt-0.5 space-y-px animate-fade-in">
              {savedViews.length === 0 ? (
                <p className="px-2.5 py-2 text-[11px] text-[#9CA3AF]">No saved views yet</p>
              ) : (
                savedViews.map((view) => {
                  const isActive = pathname === `/views/${view.id}`;
                  return (
                    <Link
                      key={view.id}
                      href={`/views/${view.id}`}
                      className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] transition-all duration-150",
                        isActive
                          ? "bg-white text-[#1E1B4B] shadow-sm"
                          : "text-[#6B7280] hover:bg-white/60 hover:text-[#1E1B4B]"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-[#7C3AED] rounded-full" />
                      )}
                      <Bookmark className={cn("h-3 w-3 shrink-0", isActive ? "text-[#7C3AED]" : "text-[#C4B5FD]")} />
                      <span className="font-medium truncate">{view.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-2 mx-1 h-px bg-[#E4E0F5]" />

        {/* Labels */}
        <Link
          href="/tags"
          className={cn(
            "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 group",
            pathname === "/tags"
              ? "bg-white text-[#1E1B4B] shadow-sm"
              : "text-[#6B7280] hover:bg-white/60 hover:text-[#1E1B4B]"
          )}
        >
          {pathname === "/tags" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#7C3AED] rounded-full" />
          )}
          <Tag className={cn("h-[15px] w-[15px] shrink-0 transition-colors", pathname === "/tags" ? "text-[#7C3AED]" : "text-[#9CA3AF] group-hover:text-[#6B7280]")} />
          <span className="font-medium">Labels</span>
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-[#E4E0F5]">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-[#6B7280] hover:bg-white/60 hover:text-[#1E1B4B] transition-all duration-150 group"
        >
          <Settings className="h-[15px] w-[15px] text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
