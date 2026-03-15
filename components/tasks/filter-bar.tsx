"use client";

import React from "react";
import { Filter, SortAsc, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
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
  { value: "ALL",        label: "All" },
  { value: "TODO",        label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE",        label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL",    label: "All" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH",   label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW",    label: "Low" },
];

const SORT_OPTIONS = [
  { by: "createdAt", order: "desc", label: "Newest first" },
  { by: "createdAt", order: "asc",  label: "Oldest first" },
  { by: "dueDate",   order: "asc",  label: "Due date" },
  { by: "priority",  order: "desc", label: "Priority" },
  { by: "title",     order: "asc",  label: "Title A-Z" },
] as const;

const DUE_OPTIONS = [
  { value: "all",      label: "Any date" },
  { value: "today",    label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue",  label: "Overdue" },
];

export function FilterBar({ filters, sort, onFiltersChange, onSortChange, availableTags }: FilterBarProps) {
  const activeFilterCount = [
    filters.status && filters.status !== "ALL",
    filters.priority && filters.priority !== "ALL",
    filters.tagIds && filters.tagIds.length > 0,
    filters.dueDate && filters.dueDate !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => onFiltersChange({ status: "ALL", priority: "ALL", tagIds: [], dueDate: "all" });

  const currentSort = SORT_OPTIONS.find((s) => s.by === sort.by && s.order === sort.order);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs h-7",
              filters.status && filters.status !== "ALL" && "border-[#7C5CFF]/40 text-[#7C5CFF] bg-[#7C5CFF]/8"
            )}
          >
            Status
            {filters.status && filters.status !== "ALL" && (
              <Badge variant="primary" size="xs">{STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}</Badge>
            )}
            <ChevronDown className="h-3 w-3 text-[#52525B]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs h-7",
              filters.priority && filters.priority !== "ALL" && "border-[#7C5CFF]/40 text-[#7C5CFF] bg-[#7C5CFF]/8"
            )}
          >
            Priority
            {filters.priority && filters.priority !== "ALL" && (
              <Badge variant="primary" size="xs">{PRIORITY_OPTIONS.find((p) => p.value === filters.priority)?.label}</Badge>
            )}
            <ChevronDown className="h-3 w-3 text-[#52525B]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          {PRIORITY_OPTIONS.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.value}
              checked={filters.priority === p.value}
              onCheckedChange={() => onFiltersChange({ ...filters, priority: p.value as TaskFilters["priority"] })}
            >
              {p.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Due date filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs h-7",
              filters.dueDate && filters.dueDate !== "all" && "border-[#7C5CFF]/40 text-[#7C5CFF] bg-[#7C5CFF]/8"
            )}
          >
            Due date
            <ChevronDown className="h-3 w-3 text-[#52525B]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Labels filter */}
      {availableTags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5 text-xs h-7",
                filters.tagIds && filters.tagIds.length > 0 && "border-[#7C5CFF]/40 text-[#7C5CFF] bg-[#7C5CFF]/8"
              )}
            >
              Labels
              {filters.tagIds && filters.tagIds.length > 0 && (
                <Badge variant="primary" size="xs">{filters.tagIds.length}</Badge>
              )}
              <ChevronDown className="h-3 w-3 text-[#52525B]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <SortAsc className="h-3 w-3" />
            {currentSort?.label ?? "Sort"}
            <ChevronDown className="h-3 w-3 text-[#52525B]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
        >
          <X className="h-3 w-3" />
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
