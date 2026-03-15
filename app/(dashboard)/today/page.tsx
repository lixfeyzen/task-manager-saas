"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { EmptyState } from "@/components/shared/empty-state";
import type { TaskWithTags } from "@/types";
import type { Tag } from "@/app/generated/prisma/client";

export default function TodayPage() {
  const [tasks, setTasks] = useState<TaskWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskWithTags | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks?dueDate=today");
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
      body: JSON.stringify({ ...data, dueDate: format(new Date(), "yyyy-MM-dd") }),
    });
    if (res.ok) fetchTasks();
  };

  const handleUpdateTask = async (data: Parameters<React.ComponentProps<typeof TaskForm>["onSubmit"]>[0]) => {
    if (!editTask) return;
    const res = await fetch(`/api/tasks/${editTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchTasks();
  };

  const todayStr = format(new Date(), "EEEE, MMMM d");
  const incomplete = tasks.filter((t) => t.status !== "DONE").length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1E1E25]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-[#F59E0B]" fill="#F59E0B" />
              <span className="text-xs font-medium text-[#F59E0B] uppercase tracking-wide">Today</span>
            </div>
            <h1 className="text-[#F4F4F5] font-semibold text-lg">{todayStr}</h1>
            <p className="text-[#52525B] text-xs mt-0.5">
              {incomplete} tasks remaining
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditTask(null); setFormOpen(true); }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </Button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#52525B]">
                {progress >= 100
                  ? <span className="text-[#22C55E] font-medium">All done! 🎉</span>
                  : <>{completed} of {tasks.length} completed</>
                }
              </span>
              <span className={cn(
                "text-[11px] font-semibold tabular-nums",
                progress >= 100 ? "text-[#22C55E]" : progress > 0 ? "text-[#A1A1AA]" : "text-[#52525B]"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 bg-[#1E1E25] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: progress >= 100
                    ? "linear-gradient(to right, #22C55E, #4ADE80)"
                    : "linear-gradient(to right, #7C5CFF, #22D3EE)",
                  boxShadow: progress > 0
                    ? progress >= 100
                      ? "0 0 8px rgba(34,197,94,0.5)"
                      : "0 0 8px rgba(124,92,255,0.4)"
                    : "none",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto">
        {!isLoading && tasks.length === 0 ? (
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title="No tasks for today"
            description="Add tasks due today or schedule existing ones for today"
            action={
              <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add task for today
              </Button>
            }
          />
        ) : (
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={(task) => { setEditTask(task); setFormOpen(true); }}
            onDelete={handleDeleteTask}
            onQuickAdd={async (title) => {
              await handleCreateTask({ title, tagIds: [], status: "TODO", priority: "MEDIUM", isRecurring: false });
            }}
            onBulkComplete={async (ids) => {
              await Promise.all(ids.map((id) => handleToggleComplete(id, true)));
            }}
            onBulkDelete={async (ids) => {
              await Promise.all(ids.map((id) => handleDeleteTask(id)));
            }}
            isLoading={isLoading}
          />
        )}
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdateTask : handleCreateTask}
        initialTask={editTask}
        allTags={tags}
        defaultDueDate={new Date()}
      />
    </div>
  );
}
