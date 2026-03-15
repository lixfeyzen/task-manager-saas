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

  const hasValue = value.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 transition-all duration-150",
        "border-b border-[#1E1E25]/60",
        isActive ? "bg-[#7C5CFF]/[0.04]" : "hover:bg-white/[0.018]",
        className
      )}
    >
      <button
        type="submit"
        disabled={!hasValue || isAdding}
        className={cn(
          "flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0",
          "border-2 transition-all duration-200",
          hasValue
            ? "border-[#7C5CFF] text-[#7C5CFF] hover:bg-[#7C5CFF]/15 hover:scale-110"
            : "border-dashed border-[#2A2A35] text-[#3A3A45]",
          isAdding && "opacity-50"
        )}
      >
        <Plus className="h-3 w-3" strokeWidth={hasValue ? 2.5 : 2} />
      </button>

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent text-[13px] outline-none",
          "text-[#F4F4F5] transition-colors duration-150",
          isActive
            ? "placeholder:text-[#3A3A45]"
            : "placeholder:text-[#2A2A35] group-hover:placeholder:text-[#2E2E3A]"
        )}
      />

      {hasValue && (
        <span className="text-[10px] text-[#3A3A45] font-mono animate-fade-in">↵</span>
      )}
    </form>
  );
}
