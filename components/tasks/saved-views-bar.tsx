"use client";

import React, { useState } from "react";
import { Plus, X, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SavedView } from "@/app/generated/prisma/client";

interface SavedViewsBarProps {
  savedViews: SavedView[];
  activeViewId?: string;
  onSelectView: (viewId: string) => void;
  onSaveView: (name: string) => Promise<void>;
  onDeleteView: (viewId: string) => Promise<void>;
}

export function SavedViewsBar({
  savedViews,
  activeViewId,
  onSelectView,
  onSaveView,
  onDeleteView,
}: SavedViewsBarProps) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newViewName.trim()) return;
    setIsSaving(true);
    try {
      await onSaveView(newViewName.trim());
      setNewViewName("");
      setShowSaveInput(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Section label */}
      <span className="text-[10px] text-[#3A3A45] font-semibold uppercase tracking-widest mr-1.5">
        Views
      </span>

      {savedViews.map((view) => {
        const isActive = activeViewId === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onSelectView(view.id)}
            className={cn(
              "group inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full",
              "text-[11px] font-medium border transition-all duration-150 outline-none",
              isActive
                ? "bg-[#7C5CFF]/12 border-[#7C5CFF]/35 text-[#7C5CFF] shadow-[0_0_12px_rgba(124,92,255,0.12)]"
                : "bg-transparent border-[#1E1E25] text-[#6B6B7A] hover:border-[#2A2A35] hover:text-[#A1A1AA]"
            )}
          >
            <Bookmark className={cn("h-2.5 w-2.5 shrink-0", isActive ? "opacity-80" : "opacity-50")} />
            <span className="truncate max-w-[120px]">{view.name}</span>
            {/* Delete hit area — only visible on hover */}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); onDeleteView(view.id); }}
              className={cn(
                "opacity-0 group-hover:opacity-100 -mr-0.5 rounded-full p-0.5",
                "hover:bg-white/10 transition-all duration-150",
                isActive ? "text-[#7C5CFF]" : "text-[#52525B]"
              )}
            >
              <X className="h-2.5 w-2.5" />
            </span>
          </button>
        );
      })}

      {showSaveInput ? (
        <div className="flex items-center gap-1 animate-fade-in">
          <input
            autoFocus
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") { setShowSaveInput(false); setNewViewName(""); }
            }}
            placeholder="Name this view…"
            className={cn(
              "h-[26px] px-2.5 rounded-full text-[11px]",
              "border border-[#7C5CFF]/40 bg-[#7C5CFF]/8",
              "text-[#F4F4F5] placeholder:text-[#3A3A45]",
              "outline-none focus:border-[#7C5CFF]/60 transition-colors duration-150 w-32"
            )}
          />
          <Button
            variant="primary"
            size="xs"
            loading={isSaving}
            onClick={handleSave}
            className="rounded-full h-[26px] px-3 text-[11px]"
          >
            Save
          </Button>
          <button
            onClick={() => { setShowSaveInput(false); setNewViewName(""); }}
            className="flex items-center justify-center w-[26px] h-[26px] rounded-full text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/[0.06] transition-all duration-150"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveInput(true)}
          className={cn(
            "inline-flex items-center gap-1 h-[26px] px-2.5 rounded-full",
            "text-[11px] font-medium border border-dashed border-[#1E1E25]",
            "text-[#3A3A45] hover:border-[#2A2A35] hover:text-[#6B6B7A]",
            "transition-all duration-150 outline-none"
          )}
        >
          <Plus className="h-3 w-3" />
          Save view
        </button>
      )}
    </div>
  );
}
