"use client";

import React, { useState } from "react";
import { Calendar, MoreHorizontal, Repeat, Edit2, Trash2 } from "lucide-react";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { TaskCheckbox } from "./task-checkbox";
import { TagBadge } from "./tag-badge";
import { PriorityIcon } from "./priority-icon";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import type { TaskWithTags } from "@/types";

interface TaskCardProps {
  task: TaskWithTags;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: TaskWithTags) => void;
  onDelete: (taskId: string) => void;
  selected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  compact?: boolean;
}

const PRIORITY_STRIPE: Record<string, string> = {
  URGENT: "bg-[#DC2626]",
  HIGH:   "bg-[#D97706]",
  MEDIUM: "bg-[#7C3AED]",
  LOW:    "bg-[#9CA3AF]",
};

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  selected,
  onSelect,
  compact,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDone = task.status === "DONE";
  const overdue = !isDone && isOverdue(task.dueDate);
  const tags = task.tags.map((t) => t.tag);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-start gap-3 pl-4 pr-4 py-3",
        "border-b border-[#E4E0F5] transition-all duration-150 cursor-pointer",
        "hover:bg-[#F8F7FF]",
        selected && "bg-[#F0EDFF] border-b-[#C9C2EC]",
        isDone && "opacity-55"
      )}
      onClick={() => onEdit(task)}
    >
      {/* Priority accent stripe — left edge */}
      {!isDone && (
        <span
          className={cn(
            "absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            PRIORITY_STRIPE[task.priority] ?? "bg-[#9CA3AF]"
          )}
        />
      )}

      {/* Bulk select */}
      {onSelect && (
        <div className="flex items-center mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onSelect(task.id, e.target.checked); }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-3.5 h-3.5 rounded-sm border border-[#C9C2EC] bg-white accent-[#7C3AED] cursor-pointer",
              "transition-all duration-150",
              "opacity-0 group-hover:opacity-60",
              selected && "opacity-100"
            )}
          />
        </div>
      )}

      {/* Completion checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="mt-0.5 shrink-0">
        <TaskCheckbox
          checked={isDone}
          onChange={(checked) => onToggleComplete(task.id, checked)}
          priority={task.priority}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug break-words",
          isDone
            ? "task-done-text text-[#9CA3AF]"
            : "text-[#1E1B4B] group-hover:text-[#1E1B4B] transition-colors duration-100"
        )}>
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Meta strip */}
        {(!compact || task.dueDate || task.isRecurring || tags.length > 0) && (
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <PriorityIcon priority={task.priority} />

            {task.dueDate && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium tracking-tight",
                overdue
                  ? "text-[#DC2626]"
                  : "text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}

            {task.isRecurring && (
              <Repeat className="h-3 w-3 text-[#9CA3AF]" />
            )}

            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="xs" />
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-[#9CA3AF]">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          "flex items-center gap-0.5 self-start mt-0.5 transition-all duration-150",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center justify-center w-6 h-6 rounded-md",
              "text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F0EDFF]",
              "transition-all duration-100"
            )}>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => onDelete(task.id)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
