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
    <div className={cn("flex flex-col items-center justify-center py-24 gap-4", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-[#7C3AED]/10 blur-xl scale-[1.6] pointer-events-none" />
        <div className={cn(
          "relative w-14 h-14 rounded-2xl flex items-center justify-center",
          "bg-[#F0EDFF] border border-[#E4E0F5]",
          "text-[#C4B5FD]"
        )}>
          {icon}
        </div>
      </div>
      <div className="text-center space-y-1 max-w-[220px]">
        <p className="text-[#6B7280] font-semibold text-[13px]">{title}</p>
        {description && (
          <p className="text-[#9CA3AF] text-[11px] leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
