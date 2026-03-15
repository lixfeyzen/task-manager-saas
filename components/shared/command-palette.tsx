"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CheckSquare, Calendar, CalendarDays, Plus, Settings,
  User, LogOut, Star, Tag, Bookmark, Search, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNewTask?: () => void;
}

export function CommandPalette({ open, onClose, onNewTask }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) onClose();
      }
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const navigate = (path: string) => { router.push(path); onClose(); };
  const handleNewTask = () => { onNewTask?.(); onClose(); };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-xl bg-[#111116] border border-[#1E1E25] rounded-2xl overflow-hidden",
          "shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]",
          "animate-scale-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full" loop>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1E1E25]">
            <Search className="h-4 w-4 text-[#52525B] shrink-0" />
            <Command.Input
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder:text-[#52525B] outline-none"
            />
            <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#2A2A35] bg-[#16161D] text-[#52525B]">
              ESC
            </kbd>
          </div>

          <Command.List className="p-2 max-h-[360px] overflow-y-auto">
            <Command.Empty className="flex flex-col items-center py-8 gap-2 text-[#52525B]">
              <Search className="h-5 w-5" />
              <span className="text-sm">No results found</span>
            </Command.Empty>

            <CommandSection heading="Actions">
              <CommandItem
                icon={<Plus className="h-3.5 w-3.5" />}
                label="New task"
                shortcut="N"
                onSelect={handleNewTask}
              />
            </CommandSection>

            <CommandSection heading="Navigate">
              <CommandItem
                icon={<CheckSquare className="h-3.5 w-3.5" />}
                label="My Tasks"
                shortcut="G T"
                onSelect={() => navigate("/tasks")}
              />
              <CommandItem
                icon={<Star className="h-3.5 w-3.5" />}
                label="Today"
                shortcut="G D"
                onSelect={() => navigate("/today")}
              />
              <CommandItem
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Upcoming"
                shortcut="G U"
                onSelect={() => navigate("/upcoming")}
              />
              <CommandItem
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Labels"
                onSelect={() => navigate("/tags")}
              />
            </CommandSection>

            <CommandSection heading="Account">
              <CommandItem
                icon={<User className="h-3.5 w-3.5" />}
                label="Account settings"
                onSelect={() => navigate("/account")}
              />
              <CommandItem
                icon={<Settings className="h-3.5 w-3.5" />}
                label="Preferences"
                onSelect={() => navigate("/settings")}
              />
              <CommandItem
                icon={<LogOut className="h-3.5 w-3.5" />}
                label="Sign out"
                onSelect={() => { signOut({ callbackUrl: "/login" }); onClose(); }}
                destructive
              />
            </CommandSection>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#52525B] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5"
    >
      {children}
    </Command.Group>
  );
}

function CommandItem({
  icon, label, shortcut, onSelect, destructive,
}: {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  destructive?: boolean;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm cursor-pointer",
        "transition-colors duration-100 outline-none select-none",
        "data-[selected=true]:bg-white/5",
        destructive
          ? "text-[#F43F5E] data-[selected=true]:bg-[#F43F5E]/10"
          : "text-[#A1A1AA] data-[selected=true]:text-[#F4F4F5]"
      )}
    >
      <span className={cn("shrink-0", destructive ? "text-[#F43F5E]" : "text-[#52525B] group-data-[selected=true]:text-[#A1A1AA]")}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <div className="flex items-center gap-1">
        {shortcut?.split(" ").map((k, i) => (
          <kbd key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-[#2A2A35] bg-[#16161D] text-[#52525B]">
            {k}
          </kbd>
        ))}
        <ArrowRight className="h-3 w-3 text-[#2A2A35]" />
      </div>
    </Command.Item>
  );
}
