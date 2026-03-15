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
        {/* Ambient glow behind icon */}
        <div className="absolute inset-0 rounded-2xl bg-[#7C5CFF]/10 blur-xl scale-[1.6] pointer-events-none" />
        <div className={cn(
          "relative w-14 h-14 rounded-2xl flex items-center justify-center",
          "bg-[#111116] border border-[#1E1E25]",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "text-[#2A2A35]"
        )}>
          {icon}
        </div>
      </div>
      <div className="text-center space-y-1 max-w-[220px]">
        <p className="text-[#71717A] font-semibold text-[13px]">{title}</p>
        {description && (
          <p className="text-[#3A3A45] text-[11px] leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
