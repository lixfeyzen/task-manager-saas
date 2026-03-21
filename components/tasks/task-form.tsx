"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Repeat, Tag, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TagBadge } from "./tag-badge";
import { TagSelector } from "./tag-selector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { TaskWithTags } from "@/types";
import type { Tag as TagType } from "@/app/generated/prisma/client";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  reminderAt: z.string().optional(),
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
  { value: "TODO",        label: "Todo",        dot: "#52525B" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "#22D3EE" },
  { value: "DONE",        label: "Done",        dot: "#22C55E" },
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
        reminderAt: initialTask.reminderAt
          ? format(new Date(initialTask.reminderAt), "yyyy-MM-dd'T'HH:mm")
          : "",
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
    setShowTagSelector(false);
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
  const status = watch("status");
  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === priority);
  const statusOption = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2 mb-0.5">
            {/* Status dot indicator */}
            <span
              className="w-2 h-2 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-[#111116] transition-colors duration-200"
              style={{ backgroundColor: statusOption?.dot ?? "#52525B" }}
            />
            <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-widest">
              {initialTask ? "Edit task" : "New task"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            {/* Title — large, no border */}
            <div>
              <input
                {...register("title")}
                placeholder="What needs to be done?"
                autoFocus
                className={cn(
                  "w-full bg-transparent border-none outline-none",
                  "text-[#F4F4F5] text-lg font-semibold leading-snug",
                  "placeholder:text-[#282830] focus:placeholder:text-[#3A3A45]",
                  "transition-colors duration-150"
                )}
              />
              {errors.title && (
                <p className="text-[11px] text-[#F43F5E] mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <textarea
              {...register("description")}
              placeholder="Add notes, links, or context…"
              rows={3}
              className={cn(
                "w-full bg-transparent border-none outline-none",
                "text-sm text-[#A1A1AA] leading-relaxed resize-none",
                "placeholder:text-[#282830] focus:placeholder:text-[#3A3A45]",
                "transition-colors duration-150"
              )}
            />

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 items-center min-h-[26px]">
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
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-medium",
                  "px-2 py-0.5 rounded-full border transition-all duration-150",
                  showTagSelector
                    ? "border-[#7C5CFF]/40 bg-[#7C5CFF]/8 text-[#7C5CFF]"
                    : "border-dashed border-[#1E1E25] text-[#52525B] hover:border-[#2A2A35] hover:text-[#A1A1AA]"
                )}
              >
                <Tag className="h-2.5 w-2.5" />
                {selectedTagIds.length === 0 ? "Add label" : "Labels"}
              </button>
            </div>

            {showTagSelector && (
              <div className="animate-fade-in">
                <TagSelector
                  allTags={allTags}
                  selectedIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                  onClose={() => setShowTagSelector(false)}
                />
              </div>
            )}
          </div>

          {/* Meta toolbar — subtle divider */}
          <div className="px-5 py-3 border-t border-[#1A1A22] flex flex-wrap items-center gap-1.5">
            {/* Status pill */}
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as FormData["status"])}
            >
              <SelectTrigger className={cn(
                "h-7 w-auto text-[11px] font-medium border rounded-lg px-2.5 gap-1.5 bg-transparent",
                "focus:ring-0 focus:ring-offset-0",
                status === "DONE"        && "border-[#22C55E]/30 text-[#22C55E] bg-[#22C55E]/8",
                status === "IN_PROGRESS" && "border-[#22D3EE]/30 text-[#22D3EE] bg-[#22D3EE]/8",
                status === "TODO"        && "border-[#1E1E25] text-[#A1A1AA]"
              )}>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusOption?.dot }}
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority pill */}
            <Select
              value={priority}
              onValueChange={(v) => setValue("priority", v as FormData["priority"])}
            >
              <SelectTrigger className="h-7 w-auto text-[11px] font-medium border border-[#1E1E25] rounded-lg px-2.5 bg-transparent focus:ring-0 focus:ring-offset-0">
                <span className="font-semibold" style={{ color: priorityOption?.color }}>
                  {priorityOption?.label}
                </span>
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="font-medium" style={{ color: p.color }}>{p.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Due date */}
            <input
              type="date"
              {...register("dueDate")}
              className={cn(
                "h-7 px-2.5 text-[11px] font-medium rounded-lg border border-[#1E1E25] bg-transparent",
                "text-[#A1A1AA] hover:border-[#2A2A35] focus:outline-none focus:border-[#7C5CFF]/40",
                "transition-colors duration-150 cursor-pointer [color-scheme:dark]"
              )}
            />

            {/* Reminder */}
            <div className="relative inline-flex items-center gap-1">
              <Bell className="h-3 w-3 text-[#52525B] pointer-events-none absolute left-2" />
              <input
                type="datetime-local"
                {...register("reminderAt")}
                title="Set reminder"
                className={cn(
                  "h-7 pl-6 pr-2 text-[11px] font-medium rounded-lg border border-[#1E1E25] bg-transparent",
                  "text-[#A1A1AA] hover:border-[#2A2A35] focus:outline-none focus:border-[#7C5CFF]/40",
                  "transition-colors duration-150 cursor-pointer [color-scheme:dark]",
                  "w-[160px]"
                )}
              />
            </div>

            {/* Recurring toggle */}
            <button
              type="button"
              onClick={() => setValue("isRecurring", !isRecurring)}
              className={cn(
                "inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-all duration-150",
                isRecurring
                  ? "border-[#7C5CFF]/35 bg-[#7C5CFF]/8 text-[#7C5CFF]"
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
                <SelectTrigger className="h-7 w-auto text-[11px] border-[#7C5CFF]/30 bg-[#7C5CFF]/8 text-[#7C5CFF] rounded-lg px-2.5 focus:ring-0">
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

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-[#1A1A22] flex items-center justify-end gap-2">
            <Button variant="ghost" type="button" size="sm" onClick={onClose} className="text-[#52525B] hover:text-[#A1A1AA]">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="min-w-[100px]"
            >
              {initialTask ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
