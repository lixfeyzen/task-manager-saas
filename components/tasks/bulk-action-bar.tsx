"use client";

import React from "react";
import { CheckCheck, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
      "flex items-center gap-0.5 p-1.5",
      "bg-[#111116]/90 backdrop-blur-xl",
      "border border-[#ffffff0f] rounded-2xl",
      "shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.06)]",
      "animate-fade-in"
    )}>
      {/* Count badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 mr-0.5">
        <span className={cn(
          "min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center",
          "bg-[#7C5CFF] text-white text-[10px] font-bold tabular-nums",
          "shadow-[0_0_8px_rgba(124,92,255,0.5)]"
        )}>
          {selectedCount}
        </span>
        <span className="text-[12px] text-[#71717A] font-medium whitespace-nowrap">
          selected
        </span>
      </div>

      <div className="w-px h-5 bg-[#ffffff0d] mx-0.5" />

      {/* Complete */}
      <ActionButton
        onClick={onMarkComplete}
        icon={<CheckCheck className="h-3.5 w-3.5" />}
        label="Complete"
        colorClass="text-[#22C55E] hover:bg-[#22C55E]/10"
      />

      {/* Delete */}
      <ActionButton
        onClick={onDelete}
        icon={<Trash2 className="h-3.5 w-3.5" />}
        label="Delete"
        colorClass="text-[#F43F5E] hover:bg-[#F43F5E]/10"
      />

      <div className="w-px h-5 bg-[#ffffff0d] mx-0.5" />

      {/* Clear */}
      <button
        onClick={onClearSelection}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-xl",
          "text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/[0.06]",
          "transition-all duration-150"
        )}
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  colorClass,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  colorClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-xl",
        "text-[12px] font-medium transition-all duration-150",
        colorClass
      )}
    >
      {icon}
      {label}
    </button>
  );
}
