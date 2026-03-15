"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CheckSquare, CalendarDays, Plus, Settings,
  User, LogOut, Star, Tag, Search,
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-[520px] bg-[#111116] rounded-2xl overflow-hidden",
          "border border-[#ffffff0f]",
          "shadow-[0_32px_80px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]",
          "animate-scale-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full" loop>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#ffffff08]">
            <Search className="h-4 w-4 text-[#3A3A45] shrink-0" />
            <Command.Input
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-[13px] text-[#F4F4F5] placeholder:text-[#3A3A45] outline-none"
            />
            <Kbd>ESC</Kbd>
          </div>

          <Command.List className="p-1.5 max-h-[380px] overflow-y-auto">
            <Command.Empty className="flex flex-col items-center py-10 gap-2">
              <Search className="h-5 w-5 text-[#2A2A35]" />
              <span className="text-[12px] text-[#3A3A45]">No results found</span>
            </Command.Empty>

            <CommandSection heading="Actions">
              <CommandItem
                icon={<Plus className="h-3.5 w-3.5" />}
                label="New task"
                shortcut="N"
                onSelect={handleNewTask}
                accent
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

          {/* Footer hint */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#ffffff06]">
            <span className="flex items-center gap-1 text-[10px] text-[#2A2A35]">
              <Kbd small>↑</Kbd><Kbd small>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#2A2A35]">
              <Kbd small>↵</Kbd> select
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Kbd({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <kbd className={cn(
      "font-mono border border-[#ffffff0f] bg-[#ffffff05] text-[#52525B] rounded",
      small ? "text-[9px] px-1 py-px" : "text-[10px] px-1.5 py-0.5"
    )}>
      {children}
    </kbd>
  );
}

function CommandSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#3A3A45] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5"
    >
      {children}
    </Command.Group>
  );
}

function CommandItem({
  icon, label, shortcut, onSelect, destructive, accent,
}: {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  destructive?: boolean;
  accent?: boolean;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] cursor-pointer",
        "transition-all duration-100 outline-none select-none",
        destructive
          ? "text-[#F43F5E] data-[selected=true]:bg-[#F43F5E]/10"
          : accent
            ? "text-[#A1A1AA] data-[selected=true]:bg-[#7C5CFF]/12 data-[selected=true]:text-[#F4F4F5]"
            : "text-[#A1A1AA] data-[selected=true]:bg-[#ffffff06] data-[selected=true]:text-[#F4F4F5]"
      )}
    >
      {/* Icon container */}
      <span className={cn(
        "flex items-center justify-center w-6 h-6 rounded-lg shrink-0",
        destructive
          ? "bg-[#F43F5E]/10 text-[#F43F5E]"
          : accent
            ? "bg-[#7C5CFF]/15 text-[#7C5CFF]"
            : "bg-[#ffffff06] text-[#52525B]"
      )}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <div className="flex items-center gap-0.5">
          {shortcut.split(" ").map((k, i) => (
            <Kbd key={i}>{k}</Kbd>
          ))}
        </div>
      )}
    </Command.Item>
  );
}
