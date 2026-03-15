import React from "react";
import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPriorityColor } from "@/lib/utils";

interface PriorityIconProps {
  priority: string;
  className?: string;
}

type IconComponent = React.ComponentType<{ className?: string }>;

const PRIORITY_CONFIG: Record<string, { Icon: IconComponent }> = {
  URGENT: { Icon: AlertTriangle },
  HIGH:   { Icon: ArrowUp },
  MEDIUM: { Icon: ArrowRight },
  LOW:    { Icon: ArrowDown },
};

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  const color = getPriorityColor(priority);
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md w-[18px] h-[18px] shrink-0",
        priority === "URGENT" && "bg-[#F43F5E]/10",
        priority === "HIGH"   && "bg-[#F59E0B]/10",
        className
      )}
      style={{ color }}
    >
      <Icon className="h-3 w-3" />
    </span>
  );
}
