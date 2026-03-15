"use client";

import React from "react";
import { CheckCheck, Trash2, X, Tag, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onMarkComplete: () => void;
  onDelete: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onMarkComplete,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
      "flex items-center gap-1 px-2 py-2",
      "bg-[#16161D] border border-[#2A2A35] rounded-2xl",
      "shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]",
      "animate-fade-in"
    )}>
      {/* Count */}
      <div className="flex items-center gap-1.5 px-3 py-1 mr-1">
        <div className="w-5 h-5 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white text-[11px] font-bold">
          {selectedCount}
        </div>
        <span className="text-sm text-[#A1A1AA] font-medium">selected</span>
      </div>

      <div className="w-px h-6 bg-[#1E1E25]" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onMarkComplete}
        className="gap-1.5 text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
      >
        <CheckCheck className="h-3.5 w-3.5" />
        Complete
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="gap-1.5 text-[#F43F5E] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>

      <div className="w-px h-6 bg-[#1E1E25]" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClearSelection}
        className="text-[#52525B] hover:text-[#A1A1AA]"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
