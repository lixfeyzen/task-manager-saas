"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare, Calendar, CalendarDays, Inbox, Star,
  Plus, Settings, ChevronDown, ChevronRight, Bookmark,
  Tag, Hash, LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SavedView } from "@/app/generated/prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  shortcut?: string;
}

const mainNav: NavItem[] = [
  { href: "/tasks",    label: "My Tasks",  icon: <CheckSquare className="h-4 w-4" />, shortcut: "G T" },
  { href: "/today",    label: "Today",     icon: <Star className="h-4 w-4" />,         shortcut: "G D" },
  { href: "/upcoming", label: "Upcoming",  icon: <CalendarDays className="h-4 w-4" />, shortcut: "G U" },
  { href: "/inbox",    label: "Inbox",     icon: <Inbox className="h-4 w-4" /> },
];

interface SidebarProps {
  savedViews?: SavedView[];
  taskCounts?: { today?: number; tasks?: number };
}

export function Sidebar({ savedViews = [], taskCounts = {} }: SidebarProps) {
  const pathname = usePathname();
  const [viewsOpen, setViewsOpen] = useState(true);

  return (
    <aside className="w-56 h-full flex flex-col bg-[#0B0B0F] border-r border-[#1E1E25] shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#1E1E25]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C5CFF] to-[#6D4DF5] flex items-center justify-center shadow-[0_0_12px_rgba(124,92,255,0.4)]">
            <CheckSquare className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[#F4F4F5] font-semibold text-sm tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
          const count = item.href === "/today" ? taskCounts.today : item.href === "/tasks" ? taskCounts.tasks : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-[#7C5CFF]/15 text-[#F4F4F5]"
                  : "text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]"
              )}
            >
              <span className={cn(
                "transition-colors duration-150",
                isActive ? "text-[#7C5CFF]" : "text-[#52525B] group-hover:text-[#A1A1AA]"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  isActive ? "bg-[#7C5CFF]/30 text-[#7C5CFF]" : "bg-[#1E1E25] text-[#52525B]"
                )}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 h-px bg-[#1E1E25]" />

        {/* Saved Views */}
        <div>
          <button
            onClick={() => setViewsOpen(!viewsOpen)}
            className="w-full flex items-center gap-1.5 px-2.5 py-1 text-[#52525B] hover:text-[#A1A1AA] transition-colors duration-150 group"
          >
            {viewsOpen
              ? <ChevronDown className="h-3 w-3 transition-transform duration-150" />
              : <ChevronRight className="h-3 w-3 transition-transform duration-150" />
            }
            <span className="text-[11px] font-medium uppercase tracking-wider">Views</span>
            <Plus className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
          </button>

          {viewsOpen && (
            <div className="mt-0.5 space-y-0.5 animate-fade-in">
              {savedViews.length === 0 ? (
                <p className="px-2.5 py-2 text-[11px] text-[#52525B] italic">No saved views yet</p>
              ) : (
                savedViews.map((view) => {
                  const isActive = pathname === `/views/${view.id}`;
                  return (
                    <Link
                      key={view.id}
                      href={`/views/${view.id}`}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
                        isActive
                          ? "bg-[#7C5CFF]/15 text-[#F4F4F5]"
                          : "text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]"
                      )}
                    >
                      <Bookmark className="h-3.5 w-3.5 text-[#52525B]" />
                      <span className="flex-1 font-medium truncate">{view.name}</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-[#1E1E25]" />

        {/* Other */}
        <Link
          href="/tags"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150",
            pathname === "/tags"
              ? "bg-[#7C5CFF]/15 text-[#F4F4F5]"
              : "text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]"
          )}
        >
          <Tag className="h-4 w-4 text-[#52525B]" />
          <span className="font-medium">Labels</span>
        </Link>
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-[#1E1E25]">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5] transition-all duration-150"
        >
          <Settings className="h-4 w-4 text-[#52525B]" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
