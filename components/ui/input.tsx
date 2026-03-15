"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-white border border-[#E4E0F5] text-[#1E1B4B] text-sm rounded-lg",
              "px-3 py-2.5 transition-all duration-150",
              "placeholder:text-[#C4B5FD]",
              "hover:border-[#C9C2EC]",
              "focus:outline-none focus:border-[#7C3AED]/60 focus:ring-2 focus:ring-[#7C3AED]/10",
              error && "border-[#DC2626]/40 focus:border-[#DC2626]/60 focus:ring-[#DC2626]/10",
              icon && "pl-9",
              suffix && "pr-9",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#DC2626] flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
