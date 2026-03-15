import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday, isPast, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function formatDateFull(date: Date | string | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT": return "#F43F5E";
    case "HIGH":   return "#F59E0B";
    case "MEDIUM": return "#7C5CFF";
    case "LOW":    return "#52525B";
    default:       return "#52525B";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "DONE":        return "#22C55E";
    case "IN_PROGRESS": return "#22D3EE";
    case "TODO":        return "#A1A1AA";
    default:            return "#A1A1AA";
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "URGENT": return "Urgent";
    case "HIGH":   return "High";
    case "MEDIUM": return "Medium";
    case "LOW":    return "Low";
    default:       return priority;
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "TODO":        return "Todo";
    case "IN_PROGRESS": return "In Progress";
    case "DONE":        return "Done";
    default:            return status;
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
