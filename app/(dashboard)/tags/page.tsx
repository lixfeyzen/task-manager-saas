"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { Tag as TagType } from "@/app/generated/prisma/client";

const TAG_COLORS = [
  "#7C5CFF", "#22D3EE", "#22C55E", "#F59E0B", "#F43F5E",
  "#EC4899", "#8B5CF6", "#06B6D4", "#10B981", "#F97316",
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(TAG_COLORS[0]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) setTags((await res.json()).tags ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    if (res.ok) { setNewName(""); setShowNew(false); fetchTags(); }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    if (res.ok) { setEditingId(null); fetchTags(); }
  };

  const handleDelete = async (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
  };

  const startEdit = (tag: TagType) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[#F4F4F5] font-semibold text-xl">Labels</h1>
          <p className="text-[#52525B] text-sm mt-1">Organize tasks with color-coded labels</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-3.5 w-3.5" />
          New label
        </Button>
      </div>

      <div className="space-y-2">
        {/* Create new */}
        {showNew && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#111116] border border-[#7C5CFF]/30 animate-fade-in">
            <div className="flex gap-1.5 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn(
                    "w-5 h-5 rounded-full transition-all duration-150",
                    newColor === c && "ring-2 ring-white/30 ring-offset-1 ring-offset-[#111116] scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowNew(false); setNewName(""); } }}
              placeholder="Label name…"
              className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder:text-[#52525B] outline-none"
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="w-7 h-7 rounded-lg bg-[#7C5CFF] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#6D4DF5] transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setShowNew(false); setNewName(""); }}
                className="w-7 h-7 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tag list */}
        {!isLoading && tags.length === 0 && !showNew && (
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title="No labels yet"
            description="Create labels to organize and filter your tasks"
            action={
              <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
                <Plus className="h-3.5 w-3.5" />
                Create first label
              </Button>
            }
          />
        )}

        {tags.map((tag) => {
          const r = parseInt(tag.color.slice(1, 3), 16);
          const g = parseInt(tag.color.slice(3, 5), 16);
          const b = parseInt(tag.color.slice(5, 7), 16);
          const isEditing = editingId === tag.id;

          return (
            <div
              key={tag.id}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150",
                "bg-[#111116] border",
                isEditing
                  ? "border-[#7C5CFF]/25"
                  : "border-[#1E1E25] hover:border-[#2A2A35] hover:bg-[#16161D]"
              )}
            >
              {!isEditing && (
                <span
                  className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              {isEditing ? (
                <>
                  <div className="flex gap-1.5 flex-wrap">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all duration-150",
                          editColor === c && "ring-2 ring-white/30 ring-offset-1 ring-offset-[#111116] scale-110"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(tag.id); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 bg-transparent text-sm text-[#F4F4F5] outline-none"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="w-7 h-7 rounded-lg bg-[#7C5CFF] text-white flex items-center justify-center hover:bg-[#6D4DF5] transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-7 h-7 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/5 flex items-center justify-center"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: tag.color,
                      boxShadow: `0 0 6px rgba(${r},${g},${b},0.4)`,
                    }}
                  />
                  <span className="flex-1 text-[13px] font-medium text-[#D4D4D8] group-hover:text-[#F4F4F5] transition-colors duration-150">
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0">
                    <button
                      onClick={() => startEdit(tag)}
                      className="w-7 h-7 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/[0.06] flex items-center justify-center transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="w-7 h-7 rounded-lg text-[#52525B] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 flex items-center justify-center transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
