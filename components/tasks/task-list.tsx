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
      <div className="p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#111116] border border-[#1E1E25] flex items-center justify-center">
          <CheckSquare className="h-7 w-7 text-[#2A2A35]" />
        </div>
        <div className="text-center">
          <p className="text-[#A1A1AA] font-medium text-sm">All clear</p>
          <p className="text-[#52525B] text-xs mt-1">No tasks match your filters</p>
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#52525B] uppercase tracking-wider hover:text-[#A1A1AA] transition-colors duration-150"
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                    group.key === "DONE"        && "bg-[#22C55E]/15 text-[#22C55E]",
                    group.key === "IN_PROGRESS" && "bg-[#22D3EE]/15 text-[#22D3EE]",
                    group.key === "TODO"        && "bg-[#52525B]/20 text-[#52525B]"
                  )}>
                    {groupTasks.length}
                  </span>
                  {group.label}
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
