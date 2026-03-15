"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/app/generated/prisma/client";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: "xs" | "sm";
  className?: string;
}

export function TagBadge({ tag, onRemove, size = "sm", className }: TagBadgeProps) {
  const hex = tag.color ?? "#7C5CFF";
  // Convert hex to rgb for transparency
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border transition-all duration-150",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className
      )}
      style={{
        backgroundColor: `rgba(${r},${g},${b},0.12)`,
        borderColor: `rgba(${r},${g},${b},0.25)`,
        color: hex,
      }}
    >
      <span
        className={cn("rounded-full shrink-0", size === "xs" ? "w-1 h-1" : "w-1.5 h-1.5")}
        style={{ backgroundColor: hex }}
      />
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 -mr-0.5 rounded-full hover:bg-black/25 p-0.5 transition-colors duration-100 opacity-70 hover:opacity-100"
        >
          <X className="h-2 w-2" />
        </button>
      )}
    </span>
  );
}
