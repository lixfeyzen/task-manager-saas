"use client";

import React, { useState } from "react";
import { Plus, X, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[11px] text-[#52525B] font-medium uppercase tracking-wider mr-1">
        Views
      </span>

      {savedViews.map((view) => (
        <button
          key={view.id}
          onClick={() => onSelectView(view.id)}
          className={cn(
            "group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium",
            "border transition-all duration-150",
            activeViewId === view.id
              ? "bg-[#7C5CFF]/15 border-[#7C5CFF]/30 text-[#7C5CFF]"
              : "bg-transparent border-[#1E1E25] text-[#A1A1AA] hover:border-[#2A2A35] hover:text-[#F4F4F5]"
          )}
        >
          <Bookmark className="h-3 w-3" />
          {view.name}
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onDeleteView(view.id); }}
            className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-white/10 transition-all duration-150 ml-0.5 -mr-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </span>
        </button>
      ))}

      {showSaveInput ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") { setShowSaveInput(false); setNewViewName(""); }
            }}
            placeholder="View name…"
            className="h-7 px-2.5 rounded-lg border border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-xs text-[#F4F4F5] placeholder:text-[#52525B] outline-none w-36"
          />
          <Button
            variant="primary"
            size="xs"
            loading={isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => { setShowSaveInput(false); setNewViewName(""); }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveInput(true)}
          className="inline-flex items-center gap-1 h-7 px-2 rounded-lg text-xs text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/5 border border-dashed border-[#1E1E25] hover:border-[#2A2A35] transition-all duration-150"
        >
          <Plus className="h-3 w-3" />
          Save view
        </button>
      )}
    </div>
  );
}
