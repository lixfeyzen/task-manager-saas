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
        "group flex items-start gap-3 px-4 py-3 border-b border-[#1E1E25]",
        "hover:bg-white/[0.02] transition-all duration-150 cursor-pointer",
        selected && "bg-[#7C5CFF]/8 border-b-[#7C5CFF]/20",
        isDone && "opacity-60"
      )}
      onClick={() => onEdit(task)}
    >
      {/* Select checkbox */}
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onSelect(task.id, e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-3.5 h-3.5 rounded border border-[#2A2A35] bg-transparent",
            "checked:bg-[#7C5CFF] checked:border-[#7C5CFF] cursor-pointer",
            "transition-all duration-150 shrink-0 mt-0.5",
            "opacity-0 group-hover:opacity-100",
            selected && "opacity-100"
          )}
        />
      )}

      {/* Status checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <TaskCheckbox
          checked={isDone}
          onChange={(checked) => onToggleComplete(task.id, checked)}
          priority={task.priority}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className={cn(
            "text-sm font-medium leading-tight flex-1 min-w-0 break-words",
            isDone ? "task-done-text text-[#52525B]" : "text-[#F4F4F5]"
          )}>
            {task.title}
          </span>
        </div>

        {!compact && task.description && (
          <p className="text-xs text-[#52525B] mt-1 line-clamp-1">{task.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Priority */}
          <PriorityIcon priority={task.priority} />

          {/* Due date */}
          {task.dueDate && (
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium",
              overdue ? "text-[#F43F5E]" : "text-[#52525B]"
            )}>
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Recurring */}
          {task.isRecurring && (
            <Repeat className="h-3 w-3 text-[#52525B]" />
          )}

          {/* Tags */}
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} size="xs" />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        className={cn(
          "flex items-center gap-1 transition-opacity duration-150",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center w-7 h-7 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-white/5 transition-all duration-150">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit task
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
