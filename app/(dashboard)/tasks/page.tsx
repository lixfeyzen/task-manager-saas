"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, LayoutList, Grid3x3, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { FilterBar } from "@/components/tasks/filter-bar";
import { SavedViewsBar } from "@/components/tasks/saved-views-bar";
import { cn } from "@/lib/utils";
import type { TaskWithTags, TaskFilters, TaskSort } from "@/types";
import type { Tag, SavedView } from "@/app/generated/prisma/client";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ status: "ALL", priority: "ALL", tagIds: [], dueDate: "all" });
  const [sort, setSort] = useState<TaskSort>({ by: "createdAt", order: "desc" });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskWithTags | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeViewId, setActiveViewId] = useState<string>();

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters.priority && filters.priority !== "ALL") params.set("priority", filters.priority);
      if (filters.tagIds?.length) params.set("tagIds", filters.tagIds.join(","));
      if (filters.dueDate && filters.dueDate !== "all") params.set("dueDate", filters.dueDate);
      if (search) params.set("search", search);
      params.set("sortBy", sort.by);
      params.set("sortOrder", sort.order);

      const res = await fetch(`/api/tasks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort, search]);

  const fetchTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    if (res.ok) setTags((await res.json()).tags ?? []);
  }, []);

  const fetchSavedViews = useCallback(async () => {
    const res = await fetch("/api/views");
    if (res.ok) setSavedViews((await res.json()).views ?? []);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchTags(); fetchSavedViews(); }, [fetchTags, fetchSavedViews]);

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
    const res = await fetch(`/api/tasks/${editTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) fetchTasks();
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: completed ? "DONE" : "TODO", completedAt: completed ? new Date() : null }
          : t
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

  const handleQuickAdd = async (title: string) => {
    await handleCreateTask({ title, tagIds: [], status: "TODO", priority: "MEDIUM", isRecurring: false });
  };

  const handleBulkComplete = async (ids: string[]) => {
    setTasks((prev) =>
      prev.map((t) => ids.includes(t.id) ? { ...t, status: "DONE" as const, completedAt: new Date() } : t)
    );
    await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    })));
  };

  const handleBulkDelete = async (ids: string[]) => {
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: "DELETE" })));
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters.priority && filters.priority !== "ALL") params.set("priority", filters.priority);
    if (filters.tagIds?.length) params.set("tagIds", filters.tagIds.join(","));
    if (filters.dueDate && filters.dueDate !== "all") params.set("dueDate", filters.dueDate);
    if (search) params.set("search", search);
    params.set("sortBy", sort.by);
    params.set("sortOrder", sort.order);
    // Trigger download via anchor
    const a = document.createElement("a");
    a.href = `/api/tasks/export?${params}`;
    a.download = "";
    a.click();
  };

  const handleSaveView = async (name: string) => {
    const res = await fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters, sortBy: sort.by, sortOrder: sort.order }),
    });
    if (res.ok) fetchSavedViews();
  };

  const handleDeleteView = async (viewId: string) => {
    await fetch(`/api/views/${viewId}`, { method: "DELETE" });
    fetchSavedViews();
  };

  const handleSelectView = (viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (view) {
      setFilters(view.filters as TaskFilters);
      setSort({ by: view.sortBy as TaskSort["by"], order: view.sortOrder as TaskSort["order"] });
      setActiveViewId(viewId);
    }
  };

  const incompleteCount = tasks.filter((t) => t.status !== "DONE").length;

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#1E1E25]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[#F4F4F5] font-semibold text-[17px] tracking-tight">My Tasks</h1>
            {incompleteCount > 0 && (
              <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-[#7C5CFF]/12 text-[#7C5CFF]/80 border border-[#7C5CFF]/15">
                {incompleteCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Export button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              title="Export tasks as CSV"
              className="text-[#52525B] hover:text-[#A1A1AA] px-2"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            {/* View mode toggle */}
            <div className="flex items-center bg-[#0F0F14] border border-[#1E1E25] rounded-lg p-0.5 gap-px">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-150",
                  viewMode === "list"
                    ? "bg-[#22222C] text-[#F4F4F5] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                    : "text-[#3A3A45] hover:text-[#71717A]"
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grouped")}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-150",
                  viewMode === "grouped"
                    ? "bg-[#22222C] text-[#F4F4F5] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                    : "text-[#3A3A45] hover:text-[#71717A]"
                )}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setEditTask(null); setFormOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              New task
            </Button>
          </div>
        </div>

        {/* Search */}
        <Input
          icon={<Search className="h-3 w-3" />}
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-[12px]"
        />

        {/* Filters */}
        <FilterBar
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          availableTags={tags}
        />

        {/* Saved views */}
        <SavedViewsBar
          savedViews={savedViews}
          activeViewId={activeViewId}
          onSelectView={handleSelectView}
          onSaveView={handleSaveView}
          onDeleteView={handleDeleteView}
        />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={(task) => { setEditTask(task); setFormOpen(true); }}
          onDelete={handleDeleteTask}
          onQuickAdd={handleQuickAdd}
          onBulkComplete={handleBulkComplete}
          onBulkDelete={handleBulkDelete}
          grouped={viewMode === "grouped"}
          isLoading={isLoading}
        />
      </div>

      {/* Task form */}
      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdateTask : handleCreateTask}
        initialTask={editTask}
        allTags={tags}
      />
    </div>
  );
}
