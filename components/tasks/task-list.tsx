"use client";

import React, { useState, useMemo } from "react";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { QuickAdd } from "./quick-add";
import { BulkActionBar } from "./bulk-action-bar";
import type { TaskWithTags } from "@/types";

interface TaskListProps {
  tasks: TaskWithTags[];
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: TaskWithTags) => void;
  onDelete: (taskId: string) => void;
  onQuickAdd: (title: string) => Promise<void>;
  onBulkComplete: (taskIds: string[]) => void;
  onBulkDelete: (taskIds: string[]) => void;
  grouped?: boolean;
  isLoading?: boolean;
}

const GROUPS = [
  { key: "TODO",        label: "Todo" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE",        label: "Done" },
];

export function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onQuickAdd,
  onBulkComplete,
  onBulkDelete,
  grouped,
  isLoading,
}: TaskListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  if (isLoading) {
    return (
      <div className="divide-y divide-[#E4E0F5]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ opacity: 1 - i * 0.12 }}>
            <div className="w-[18px] h-[18px] rounded-full skeleton shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 rounded-full" style={{ width: `${55 + (i % 3) * 15}%` }} />
              {i % 2 === 0 && <div className="skeleton h-2 rounded-full w-1/3" />}
            </div>
            <div className="skeleton h-2 w-10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-[#7C3AED]/8 blur-xl scale-150" />
          <div className="relative w-14 h-14 rounded-2xl bg-[#F0EDFF] border border-[#E4E0F5] flex items-center justify-center">
            <CheckSquare className="h-6 w-6 text-[#C4B5FD]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[#6B7280] font-medium text-sm">No tasks found</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  if (grouped) {
    return (
      <>
        <div className="divide-y divide-transparent">
          {GROUPS.map((group) => {
            const groupTasks = tasks.filter((t) => t.status === group.key);
            if (groupTasks.length === 0) return null;
            const isCollapsed = collapsedGroups.has(group.key);

            return (
              <div key={group.key} className="mb-2">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest hover:text-[#1E1B4B] transition-colors duration-150 group/header"
                >
                  {/* Color dot */}
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    group.key === "DONE"        && "bg-[#059669]",
                    group.key === "IN_PROGRESS" && "bg-[#0891B2]",
                    group.key === "TODO"        && "bg-[#9CA3AF]"
                  )} />
                  <span className={cn(
                    "transition-colors duration-150",
                    group.key === "DONE"        && "text-[#059669]/60 group-hover/header:text-[#059669]",
                    group.key === "IN_PROGRESS" && "text-[#0891B2]/60 group-hover/header:text-[#0891B2]",
                    group.key === "TODO"        && "text-[#52525B] group-hover/header:text-[#A1A1AA]"
                  )}>
                    {group.label}
                  </span>
                  <span className={cn(
                    "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
                    group.key === "DONE"        && "bg-[#059669]/12 text-[#059669]/70",
                    group.key === "IN_PROGRESS" && "bg-[#0891B2]/12 text-[#0891B2]/70",
                    group.key === "TODO"        && "bg-[#9CA3AF]/15 text-[#52525B]"
                  )}>
                    {groupTasks.length}
                  </span>
                  <div className="flex-1 h-px bg-[#E4E0F5] ml-1" />
                  <span className={cn(
                    "transition-all duration-150 text-[#9CA3AF]",
                    isCollapsed ? "rotate-[-90deg]" : "rotate-0"
                  )}>▾</span>
                </button>

                {/* Tasks */}
                {!isCollapsed && (
                  <div className="animate-fade-in">
                    {groupTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        selected={selectedIds.has(task.id)}
                        onSelect={toggleSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <QuickAdd onAdd={onQuickAdd} />
        <BulkActionBar
          selectedCount={selectedIds.size}
          onClearSelection={clearSelection}
          onMarkComplete={() => { onBulkComplete(Array.from(selectedIds)); clearSelection(); }}
          onDelete={() => { onBulkDelete(Array.from(selectedIds)); clearSelection(); }}
        />
      </>
    );
  }

  return (
    <>
      <div>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            selected={selectedIds.has(task.id)}
            onSelect={toggleSelect}
          />
        ))}
      </div>
      <QuickAdd onAdd={onQuickAdd} />
      <BulkActionBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onMarkComplete={() => { onBulkComplete(Array.from(selectedIds)); clearSelection(); }}
        onDelete={() => { onBulkDelete(Array.from(selectedIds)); clearSelection(); }}
      />
    </>
  );
}
