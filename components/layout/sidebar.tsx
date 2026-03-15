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
    <aside className="w-56 h-full flex flex-col bg-[#0B0B0F] border-r border-[#1E1E25]/60 shrink-0">
      {/* Workspace header */}
      <div className="h-14 flex items-center px-3.5 border-b border-[#1E1E25]/60">
        <div className="flex items-center gap-2.5 w-full">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            "bg-gradient-to-br from-[#7C5CFF] to-[#5B3FD9]",
            "shadow-[0_0_16px_rgba(124,92,255,0.35)]"
          )}>
            <CheckSquare className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#F4F4F5] tracking-tight leading-none">TaskFlow</p>
            <p className="text-[10px] text-[#3A3A45] mt-0.5 leading-none">Workspace</p>
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
                  ? "bg-[#7C5CFF]/12 text-[#F4F4F5]"
                  : "text-[#71717A] hover:bg-white/[0.04] hover:text-[#D4D4D8]"
              )}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#7C5CFF] rounded-full shadow-[0_0_6px_rgba(124,92,255,0.6)]" />
              )}
              <span className={cn(
                "shrink-0 transition-colors duration-150",
                isActive ? "text-[#7C5CFF]" : "text-[#3A3A45] group-hover:text-[#71717A]"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-[#7C5CFF]/25 text-[#7C5CFF]"
                    : "bg-[#1E1E25] text-[#52525B] group-hover:bg-[#2A2A35]"
                )}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 mx-1 h-px bg-[#1E1E25]/60" />

        {/* Saved Views section */}
        <div>
          <button
            onClick={() => setViewsOpen(!viewsOpen)}
            className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[#3A3A45] hover:text-[#71717A] transition-colors duration-150 group rounded-md"
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
                <p className="px-2.5 py-2 text-[11px] text-[#2A2A35]">No saved views yet</p>
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
                          ? "bg-[#7C5CFF]/12 text-[#F4F4F5]"
                          : "text-[#71717A] hover:bg-white/[0.04] hover:text-[#D4D4D8]"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-[#7C5CFF] rounded-full" />
                      )}
                      <Bookmark className={cn("h-3 w-3 shrink-0", isActive ? "text-[#7C5CFF]" : "text-[#2A2A35]")} />
                      <span className="font-medium truncate">{view.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-2 mx-1 h-px bg-[#1E1E25]/60" />

        {/* Labels */}
        <Link
          href="/tags"
          className={cn(
            "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150 group",
            pathname === "/tags"
              ? "bg-[#7C5CFF]/12 text-[#F4F4F5]"
              : "text-[#71717A] hover:bg-white/[0.04] hover:text-[#D4D4D8]"
          )}
        >
          {pathname === "/tags" && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#7C5CFF] rounded-full shadow-[0_0_6px_rgba(124,92,255,0.6)]" />
          )}
          <Tag className={cn("h-[15px] w-[15px] shrink-0 transition-colors", pathname === "/tags" ? "text-[#7C5CFF]" : "text-[#3A3A45] group-hover:text-[#71717A]")} />
          <span className="font-medium">Labels</span>
        </Link>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-[#1E1E25]/60">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] text-[#71717A] hover:bg-white/[0.04] hover:text-[#D4D4D8] transition-all duration-150 group"
        >
          <Settings className="h-[15px] w-[15px] text-[#3A3A45] group-hover:text-[#71717A] transition-colors" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
