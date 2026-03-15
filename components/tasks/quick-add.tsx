"use client";

import React, { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAddProps {
  onAdd: (title: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function QuickAdd({ onAdd, placeholder = "Add a task…", className }: QuickAddProps) {
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isAdding) return;
    setIsAdding(true);
    try {
      await onAdd(value.trim());
      setValue("");
      inputRef.current?.focus();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        "border-b border-[#1E1E25] transition-all duration-150",
        isActive ? "bg-[#7C5CFF]/4" : "hover:bg-white/[0.015]",
        className
      )}
    >
      <button
        type="submit"
        className={cn(
          "flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0",
          "border-2 transition-all duration-150",
          value.trim()
            ? "border-[#7C5CFF] text-[#7C5CFF]"
            : "border-[#2A2A35] text-[#52525B]",
          isAdding && "opacity-50"
        )}
      >
        <Plus className="h-3 w-3" strokeWidth={2.5} />
      </button>

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent text-sm outline-none",
          "placeholder:text-[#2A2A35] focus:placeholder:text-[#3A3A45]",
          "text-[#F4F4F5] transition-colors duration-150"
        )}
      />

      {value.trim() && (
        <span className="text-[11px] text-[#52525B]">
          ↵ to add
        </span>
      )}
    </form>
  );
}
