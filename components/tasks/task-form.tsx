"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Repeat, Tag, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "./tag-badge";
import { TagSelector } from "./tag-selector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import type { TaskWithTags } from "@/types";
import type { Tag as TagType } from "@/app/generated/prisma/client";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  isRecurring: z.boolean(),
  recurringRule: z.enum(["daily", "weekly", "monthly", "weekdays"]).optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData & { tagIds: string[] }) => Promise<void>;
  initialTask?: TaskWithTags | null;
  allTags: TagType[];
  defaultDueDate?: Date;
}

const PRIORITY_OPTIONS = [
  { value: "LOW",    label: "Low",    color: "#52525B" },
  { value: "MEDIUM", label: "Medium", color: "#7C5CFF" },
  { value: "HIGH",   label: "High",   color: "#F59E0B" },
  { value: "URGENT", label: "Urgent", color: "#F43F5E" },
];

const STATUS_OPTIONS = [
  { value: "TODO",        label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE",        label: "Done" },
];

const RECURRING_OPTIONS = [
  { value: "daily",    label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly",   label: "Weekly" },
  { value: "monthly",  label: "Monthly" },
];

export function TaskForm({ open, onClose, onSubmit, initialTask, allTags, defaultDueDate }: TaskFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: defaultDueDate ? format(defaultDueDate, "yyyy-MM-dd") : "",
      isRecurring: false,
    },
  });

  const isRecurring = watch("isRecurring");

  useEffect(() => {
    if (initialTask) {
      reset({
        title: initialTask.title,
        description: initialTask.description ?? "",
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate ? format(new Date(initialTask.dueDate), "yyyy-MM-dd") : "",
        isRecurring: initialTask.isRecurring,
        recurringRule: (initialTask.recurringRule as FormData["recurringRule"]) ?? undefined,
      });
      setSelectedTagIds(initialTask.tags.map((t) => t.tag.id));
    } else {
      reset({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: defaultDueDate ? format(defaultDueDate, "yyyy-MM-dd") : "",
        isRecurring: false,
      });
      setSelectedTagIds([]);
    }
  }, [initialTask, open, reset, defaultDueDate]);

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, tagIds: selectedTagIds });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));
  const priority = watch("priority");
  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === priority);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialTask ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <input
                {...register("title")}
                placeholder="Task title…"
                className={cn(
                  "w-full bg-transparent border-none outline-none text-[#F4F4F5]",
                  "text-lg font-semibold placeholder:text-[#2A2A35] focus:placeholder:text-[#3A3A45]",
                  "transition-colors duration-150"
                )}
                autoFocus
              />
              {errors.title && (
                <p className="text-xs text-[#F43F5E] mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <textarea
              {...register("description")}
              placeholder="Add a description…"
              rows={3}
              className={cn(
                "w-full bg-transparent border-none outline-none text-sm text-[#A1A1AA]",
                "placeholder:text-[#2A2A35] focus:placeholder:text-[#3A3A45] resize-none",
                "transition-colors duration-150 leading-relaxed"
              )}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onRemove={() => setSelectedTagIds((ids) => ids.filter((id) => id !== tag.id))}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowTagSelector(!showTagSelector)}
                className="inline-flex items-center gap-1 text-xs text-[#52525B] hover:text-[#A1A1AA] px-2 py-1 rounded-full border border-dashed border-[#1E1E25] hover:border-[#2A2A35] transition-all duration-150"
              >
                <Tag className="h-3 w-3" />
                Add label
              </button>
            </div>

            {showTagSelector && (
              <TagSelector
                allTags={allTags}
                selectedIds={selectedTagIds}
                onChange={setSelectedTagIds}
                onClose={() => setShowTagSelector(false)}
              />
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E1E25]">
              {/* Status */}
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as FormData["status"])}
              >
                <SelectTrigger className="h-8 w-auto text-xs border-[#1E1E25] bg-transparent px-2.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority */}
              <Select
                value={priority}
                onValueChange={(v) => setValue("priority", v as FormData["priority"])}
              >
                <SelectTrigger className="h-8 w-auto text-xs border-[#1E1E25] bg-transparent px-2.5">
                  <span style={{ color: priorityOption?.color }} className="font-medium">
                    {priorityOption?.label}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span style={{ color: p.color }}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Due date */}
              <div className="relative">
                <input
                  type="date"
                  {...register("dueDate")}
                  className={cn(
                    "h-8 px-2.5 text-xs rounded-lg border border-[#1E1E25] bg-transparent",
                    "text-[#A1A1AA] hover:border-[#2A2A35] focus:outline-none focus:border-[#7C5CFF]/50",
                    "transition-colors duration-150 cursor-pointer",
                    "[color-scheme:dark]"
                  )}
                />
              </div>

              {/* Recurring */}
              <button
                type="button"
                onClick={() => setValue("isRecurring", !isRecurring)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs border transition-all duration-150",
                  isRecurring
                    ? "border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-[#7C5CFF]"
                    : "border-[#1E1E25] text-[#52525B] hover:border-[#2A2A35] hover:text-[#A1A1AA]"
                )}
              >
                <Repeat className="h-3 w-3" />
                Repeat
              </button>

              {isRecurring && (
                <Select
                  value={watch("recurringRule") ?? "weekly"}
                  onValueChange={(v) => setValue("recurringRule", v as FormData["recurringRule"])}
                >
                  <SelectTrigger className="h-8 w-auto text-xs border-[#1E1E25] bg-transparent px-2.5">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRING_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" size="sm" loading={isSubmitting}>
              {initialTask ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
