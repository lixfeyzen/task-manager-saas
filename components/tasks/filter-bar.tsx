"use client";

import React from "react";
import { SortAsc, X, ChevronDown, CircleDot, Flag, CalendarRange, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown";
import type { TaskFilters, TaskSort } from "@/types";
import type { Tag } from "@/app/generated/prisma/client";

interface FilterBarProps {
  filters: TaskFilters;
  sort: TaskSort;
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (sort: TaskSort) => void;
  availableTags: Tag[];
}

const STATUS_OPTIONS = [
  { value: "ALL",         label: "All statuses" },
  { value: "TODO",        label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE",        label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL",    label: "All priorities" },
  { value: "URGENT", label: "Urgent",  color: "#F43F5E" },
  { value: "HIGH",   label: "High",    color: "#F59E0B" },
  { value: "MEDIUM", label: "Medium",  color: "#7C5CFF" },
  { value: "LOW",    label: "Low",     color: "#52525B" },
];

const SORT_OPTIONS = [
  { by: "createdAt", order: "desc", label: "Newest first" },
  { by: "createdAt", order: "asc",  label: "Oldest first" },
  { by: "dueDate",   order: "asc",  label: "Due date" },
  { by: "priority",  order: "desc", label: "Priority" },
  { by: "title",     order: "asc",  label: "Title A–Z" },
] as const;

const DUE_OPTIONS = [
  { value: "all",      label: "Any date" },
  { value: "today",    label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue",  label: "Overdue" },
];

/** Compact filter trigger pill */
function FilterPill({
  label,
  icon,
  active,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-[11px] font-medium",
            "border transition-all duration-150 outline-none select-none",
            active
              ? "bg-[#7C5CFF]/12 border-[#7C5CFF]/35 text-[#7C5CFF]"
              : "bg-transparent border-[#1E1E25] text-[#6B6B7A] hover:border-[#2A2A35] hover:text-[#A1A1AA]"
          )}
        >
          <span className={cn("opacity-60", active && "opacity-100")}>{icon}</span>
          {label}
          <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-150", active && "opacity-70")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FilterBar({ filters, sort, onFiltersChange, onSortChange, availableTags }: FilterBarProps) {
  const activeFilterCount = [
    filters.status && filters.status !== "ALL",
    filters.priority && filters.priority !== "ALL",
    filters.tagIds && filters.tagIds.length > 0,
    filters.dueDate && filters.dueDate !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => onFiltersChange({ status: "ALL", priority: "ALL", tagIds: [], dueDate: "all" });
  const currentSort = SORT_OPTIONS.find((s) => s.by === sort.by && s.order === sort.order);

  const activeStatus = STATUS_OPTIONS.find((s) => s.value === filters.status && s.value !== "ALL");
  const activePriority = PRIORITY_OPTIONS.find((p) => p.value === filters.priority && p.value !== "ALL");
  const activeDue = DUE_OPTIONS.find((d) => d.value === filters.dueDate && d.value !== "all");

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Status */}
      <FilterPill
        label={activeStatus?.label ?? "Status"}
        icon={<CircleDot className="h-3 w-3" />}
        active={!!activeStatus}
      >
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {STATUS_OPTIONS.map((s) => (
          <DropdownMenuCheckboxItem
            key={s.value}
            checked={filters.status === s.value}
            onCheckedChange={() => onFiltersChange({ ...filters, status: s.value as TaskFilters["status"] })}
          >
            {s.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterPill>

      {/* Priority */}
      <FilterPill
        label={activePriority?.label ?? "Priority"}
        icon={<Flag className="h-3 w-3" />}
        active={!!activePriority}
      >
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {PRIORITY_OPTIONS.map((p) => (
          <DropdownMenuCheckboxItem
            key={p.value}
            checked={filters.priority === p.value}
            onCheckedChange={() => onFiltersChange({ ...filters, priority: p.value as TaskFilters["priority"] })}
          >
            {p.color ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.label}
              </span>
            ) : p.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterPill>

      {/* Due date */}
      <FilterPill
        label={activeDue?.label ?? "Due date"}
        icon={<CalendarRange className="h-3 w-3" />}
        active={!!activeDue}
      >
        <DropdownMenuLabel>Due date</DropdownMenuLabel>
        {DUE_OPTIONS.map((d) => (
          <DropdownMenuCheckboxItem
            key={d.value}
            checked={filters.dueDate === d.value}
            onCheckedChange={() => onFiltersChange({ ...filters, dueDate: d.value as TaskFilters["dueDate"] })}
          >
            {d.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterPill>

      {/* Labels */}
      {availableTags.length > 0 && (
        <FilterPill
          label={
            filters.tagIds && filters.tagIds.length > 0
              ? `${filters.tagIds.length} label${filters.tagIds.length > 1 ? "s" : ""}`
              : "Labels"
          }
          icon={<Hash className="h-3 w-3" />}
          active={!!(filters.tagIds && filters.tagIds.length > 0)}
        >
          <DropdownMenuLabel>Labels</DropdownMenuLabel>
          {availableTags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={filters.tagIds?.includes(tag.id)}
              onCheckedChange={(checked) =>
                onFiltersChange({
                  ...filters,
                  tagIds: checked
                    ? [...(filters.tagIds ?? []), tag.id]
                    : (filters.tagIds ?? []).filter((id) => id !== tag.id),
                })
              }
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </FilterPill>
      )}

      {/* Separator */}
      <div className="w-px h-4 bg-[#1E1E25] mx-0.5" />

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full text-[11px] font-medium",
            "border border-[#1E1E25] text-[#6B6B7A] hover:border-[#2A2A35] hover:text-[#A1A1AA]",
            "transition-all duration-150 outline-none"
          )}>
            <SortAsc className="h-3 w-3 opacity-60" />
            {currentSort?.label ?? "Sort"}
            <ChevronDown className="h-2.5 w-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          {SORT_OPTIONS.map((s) => (
            <DropdownMenuCheckboxItem
              key={`${s.by}-${s.order}`}
              checked={sort.by === s.by && sort.order === s.order}
              onCheckedChange={() => onSortChange({ by: s.by, order: s.order })}
            >
              {s.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear active filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className={cn(
            "inline-flex items-center gap-1 h-[26px] px-2 rounded-full text-[11px] font-medium",
            "text-[#52525B] hover:text-[#F43F5E] transition-colors duration-150"
          )}
        >
          <X className="h-3 w-3" />
          Clear {activeFilterCount}
        </button>
      )}
    </div>
  );
}
