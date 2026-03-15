"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { TaskWithTags } from "@/types";
import type { Tag } from "@/app/generated/prisma/client";

const DAYS_AHEAD = 14;

export default function UpcomingPage() {
  const [tasks, setTasks] = useState<TaskWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskWithTags | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?dueDate=upcoming&status=TODO,IN_PROGRESS");
      if (res.ok) setTasks((await res.json()).tasks ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    if (res.ok) setTags((await res.json()).tags ?? []);
  }, []);

  useEffect(() => { fetchTasks(); fetchTags(); }, [fetchTasks, fetchTags]);

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: completed ? "DONE" : "TODO", completedAt: completed ? new Date() : null } : t
      )
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: completed ? "DONE" : "TODO" }),
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const handleCreateTask = async (data: Parameters<React.ComponentProps<typeof TaskForm>["onSubmit"]>[0]) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchTasks();
  };

  const handleUpdateTask = async (data: Parameters<React.ComponentProps<typeof TaskForm>["onSubmit"]>[0]) => {
    if (!editTask) return;
    await fetch(`/api/tasks/${editTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchTasks();
  };

  // Build day buckets
  const today = startOfDay(new Date());
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));

  const noDateTasks = tasks.filter((t) => !t.dueDate);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1E1E25]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-[#22D3EE]" />
              <span className="text-xs font-medium text-[#22D3EE] uppercase tracking-wide">Upcoming</span>
            </div>
            <h1 className="text-[#F4F4F5] font-semibold text-lg">Next {DAYS_AHEAD} days</h1>
            <p className="text-[#52525B] text-xs mt-0.5">{tasks.length} tasks scheduled</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditTask(null); setSelectedDate(null); setFormOpen(true); }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        </div>
      </div>

      {/* Day view */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          if (dayTasks.length === 0) return null;

          const isToday = isSameDay(day, today);
          const label = isToday ? "Today" : format(day, "EEE, MMM d");

          return (
            <div key={day.toISOString()}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className={cn(
                  "text-[11px] font-semibold uppercase tracking-widest",
                  isToday ? "text-[#F59E0B]" : "text-[#3A3A45]"
                )}>
                  {label}
                </span>
                <span className={cn(
                  "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
                  isToday ? "bg-[#F59E0B]/12 text-[#F59E0B]" : "bg-[#1E1E25] text-[#52525B]"
                )}>
                  {dayTasks.length}
                </span>
                <div className={cn("flex-1 h-px", isToday ? "bg-[#F59E0B]/15" : "bg-[#1E1E25]")} />
                <button
                  onClick={() => { setSelectedDate(day); setEditTask(null); setFormOpen(true); }}
                  className="text-[#3A3A45] hover:text-[#71717A] transition-colors duration-150"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className={cn(
                "border rounded-xl overflow-hidden",
                isToday ? "bg-[#111116] border-[#F59E0B]/10" : "bg-[#111116] border-[#1E1E25]"
              )}>
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(t) => { setEditTask(t); setFormOpen(true); }}
                    onDelete={handleDeleteTask}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* No due date */}
        {noDateTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#52525B]">
                No date
              </span>
              <span className="text-[11px] bg-[#1E1E25] text-[#52525B] px-1.5 py-0.5 rounded-full">{noDateTasks.length}</span>
              <div className="flex-1 h-px bg-[#1E1E25]" />
            </div>
            <div className="bg-[#111116] border border-[#1E1E25] rounded-xl overflow-hidden">
              {noDateTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => { setEditTask(t); setFormOpen(true); }}
                  onDelete={handleDeleteTask}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="Nothing coming up"
            description="Tasks with due dates will appear here"
          />
        )}
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); setSelectedDate(null); }}
        onSubmit={editTask ? handleUpdateTask : handleCreateTask}
        initialTask={editTask}
        allTags={tags}
        defaultDueDate={selectedDate ?? undefined}
      />
    </div>
  );
}
