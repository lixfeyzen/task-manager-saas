import type { Task, Tag, User, SavedView, TaskStatus, Priority } from "@/app/generated/prisma/client";

export type { TaskStatus, Priority };

export type TagWithCount = Tag & {
  _count?: { tasks: number };
};

export type TaskWithTags = Task & {
  tags: Array<{ tag: Tag }>;
};

export type TaskWithTagsFull = Task & {
  tags: Array<{ tag: Tag; tagId: string; taskId: string }>;
};

export type UserProfile = Pick<User, "id" | "email" | "name" | "image" | "createdAt" | "emailVerified">;

export type SavedViewWithFilters = SavedView;

export interface TaskFilters {
  status?: TaskStatus | "ALL";
  priority?: Priority | "ALL";
  tagIds?: string[];
  search?: string;
  dueDate?: "today" | "upcoming" | "overdue" | "none" | "all";
}

export interface TaskSort {
  by: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title";
  order: "asc" | "desc";
}

export interface ViewMode {
  type: "list" | "grouped";
}

export type RecurringRule = "daily" | "weekly" | "monthly" | "weekdays";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  tagIds?: string[];
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completedAt?: Date | null;
}

export interface CreateTagInput {
  name: string;
  color: string;
}
