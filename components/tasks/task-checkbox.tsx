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

export function TaskCheckbox({ checked, onChange, priority, disabled }: TaskCheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);

  const borderColor = {
    URGENT: "#F43F5E",
    HIGH:   "#F59E0B",
    MEDIUM: "#7C5CFF",
    LOW:    "#52525B",
  }[priority ?? "MEDIUM"] ?? "#7C5CFF";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0",
        "border-2 transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]/50",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        checked
          ? "border-transparent bg-[#22C55E]"
          : "bg-transparent"
      )}
      style={{
        borderColor: checked ? "transparent" : isHovered ? borderColor : "rgba(82,82,91,0.8)",
        boxShadow: checked ? "0 0 8px rgba(34,197,94,0.4)" : isHovered ? `0 0 8px ${borderColor}40` : "none",
      }}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
    >
      {checked && (
        <Check
          className="h-2.5 w-2.5 text-white animate-[check-in_200ms_ease-out]"
          strokeWidth={3}
        />
      )}
      {!checked && isHovered && (
        <Check
          className="h-2 w-2 opacity-50 transition-opacity"
          strokeWidth={3}
          style={{ color: borderColor }}
        />
      )}
    </button>
  );
}
