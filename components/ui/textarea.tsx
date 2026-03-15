"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-[#A1A1AA] tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-[#111116] border border-[#1E1E25] text-[#F4F4F5] text-sm rounded-lg",
            "px-3 py-2.5 transition-all duration-150 resize-none",
            "placeholder:text-[#52525B]",
            "hover:border-[#2A2A35]",
            "focus:outline-none focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/30",
            "min-h-[80px]",
            error && "border-[#F43F5E]/50 focus:border-[#F43F5E]/70",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
