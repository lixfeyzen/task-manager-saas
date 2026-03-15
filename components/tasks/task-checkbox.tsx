"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  priority?: string;
  disabled?: boolean;
}

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: "#F43F5E",
  HIGH:   "#F59E0B",
  MEDIUM: "#7C5CFF",
  LOW:    "#52525B",
};

export function TaskCheckbox({ checked, onChange, priority, disabled }: TaskCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = PRIORITY_COLOR[priority ?? "MEDIUM"] ?? "#7C5CFF";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center justify-center shrink-0",
        "w-[18px] h-[18px] rounded-full",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B0B0F]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        checked
          ? "bg-[#22C55E] border-2 border-transparent"
          : "bg-transparent border-2"
      )}
      style={{
        borderColor: checked
          ? "transparent"
          : isHovered
            ? accentColor
            : "rgba(60,60,75,0.9)",
        boxShadow: checked
          ? "0 0 0 3px rgba(34,197,94,0.15), 0 0 10px rgba(34,197,94,0.2)"
          : isHovered
            ? `0 0 0 3px ${accentColor}18, 0 0 8px ${accentColor}25`
            : "none",
      }}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
    >
      {/* Checked: animated check */}
      {checked && (
        <Check
          className="h-[9px] w-[9px] text-white"
          style={{ animation: "checkIn 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}
          strokeWidth={3.5}
        />
      )}

      {/* Hover ghost check */}
      {!checked && isHovered && (
        <Check
          className="h-[8px] w-[8px] transition-opacity duration-100"
          strokeWidth={3}
          style={{ color: accentColor, opacity: 0.5 }}
        />
      )}
    </button>
  );
}
