import React from "react";
import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPriorityColor } from "@/lib/utils";

interface PriorityIconProps {
  priority: string;
  className?: string;
}

export function PriorityIcon({ priority, className }: PriorityIconProps) {
  const color = getPriorityColor(priority);

  const icon = {
    URGENT: <AlertTriangle className={cn("h-3.5 w-3.5", className)} />,
    HIGH:   <ArrowUp className={cn("h-3.5 w-3.5", className)} />,
    MEDIUM: <ArrowRight className={cn("h-3.5 w-3.5", className)} />,
    LOW:    <ArrowDown className={cn("h-3.5 w-3.5", className)} />,
  }[priority] ?? <ArrowRight className={cn("h-3.5 w-3.5", className)} />;

  return <span style={{ color }}>{icon}</span>;
}
