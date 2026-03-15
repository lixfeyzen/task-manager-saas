"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/app/generated/prisma/client";

const TAG_COLORS = [
  "#7C5CFF", "#22D3EE", "#22C55E", "#F59E0B", "#F43F5E",
  "#EC4899", "#8B5CF6", "#06B6D4", "#10B981", "#F97316",
];

interface TagSelectorProps {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
  onCreateTag?: (name: string, color: string) => Promise<Tag>;
}

export function TagSelector({ allTags, selectedIds, onChange, onClose, onCreateTag }: TagSelectorProps) {
  const [search, setSearch] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = allTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const handleCreate = async () => {
    if (!search.trim() || !onCreateTag) return;
    setIsCreating(true);
    try {
      const newTag = await onCreateTag(search.trim(), newTagColor);
      onChange([...selectedIds, newTag.id]);
      setSearch("");
    } finally {
      setIsCreating(false);
    }
  };

  const showCreate = search.trim() && !filtered.some((t) => t.name.toLowerCase() === search.toLowerCase()) && onCreateTag;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[#1E1E25] bg-[#16161D] overflow-hidden",
        "shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-scale-in"
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1E1E25]">
        <Search className="h-3.5 w-3.5 text-[#52525B] shrink-0" />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labels…"
          className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder:text-[#52525B] outline-none"
        />
      </div>

      {/* Tags list */}
      <div className="p-1 max-h-48 overflow-y-auto">
        {filtered.length === 0 && !showCreate && (
          <p className="text-[11px] text-[#3A3A45] px-3 py-3 text-center">No labels found</p>
        )}
        {filtered.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          const r = parseInt(tag.color.slice(1, 3), 16);
          const g = parseInt(tag.color.slice(3, 5), 16);
          const b = parseInt(tag.color.slice(5, 7), 16);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px]",
                "transition-colors duration-100",
                selected
                  ? "bg-[#7C5CFF]/8 text-[#F4F4F5]"
                  : "text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="flex-1 text-left">{tag.name}</span>
              {selected && <Check className="h-3.5 w-3.5 text-[#7C5CFF]" />}
            </button>
          );
        })}
        {showCreate && (
          <>
            <div className="my-1 h-px bg-[#1E1E25]" />
            <div className="px-2.5 py-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    className={cn(
                      "w-5 h-5 rounded-full transition-all duration-150",
                      newTagColor === c && "ring-2 ring-white/30 ring-offset-1 ring-offset-[#16161D] scale-110"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm",
                  "text-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-colors duration-100"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Create &ldquo;{search}&rdquo;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
