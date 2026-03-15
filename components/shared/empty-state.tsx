import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 gap-4", className)}>
      <div className="w-16 h-16 rounded-2xl bg-[#111116] border border-[#1E1E25] flex items-center justify-center text-[#2A2A35]">
        {icon}
      </div>
      <div className="text-center space-y-1">
        <p className="text-[#A1A1AA] font-medium text-sm">{title}</p>
        {description && <p className="text-[#52525B] text-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
